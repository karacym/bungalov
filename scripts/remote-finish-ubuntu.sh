#!/bin/bash
# Bootstrap yarıda kaldıysa (ör. next build): frontend build + PM2 + Nginx
set -euo pipefail
PUBLIC_IP="${PUBLIC_IP:-80.225.240.253}"
ROOT="${HOME}/bungalov"

test -d "$ROOT/frontend" || { echo "Yok: $ROOT — önce clone/bootstrap çalıştırın."; exit 1; }

echo "==> Frontend build (--no-lint)"
cd "$ROOT/frontend"
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build -- --no-lint

echo "==> PM2"
pm2 delete bungalov-backend 2>/dev/null || true
pm2 delete bungalov-frontend 2>/dev/null || true
pm2 start npm --name bungalov-backend --cwd "$ROOT/backend" -- run start:prod
pm2 start npm --name bungalov-frontend --cwd "$ROOT/frontend" -- run start
pm2 save
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

echo "==> Nginx site"
sudo tee /etc/nginx/sites-available/bungalov >/dev/null <<EOF
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name bungalov.savaskara.com ${PUBLIC_IP};

    client_max_body_size 25M;

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/bungalov /etc/nginx/sites-enabled/bungalov
sudo nginx -t
sudo systemctl reload nginx

echo "==> Bitti. http://${PUBLIC_IP}/ ve API /api/"
