#!/bin/bash
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
REPO_URL="${REPO_URL:-https://github.com/karacym/bungalov.git}"
PUBLIC_IP="${PUBLIC_IP:-80.225.240.253}"

echo "==> Paketler"
sudo apt-get update -qq
sudo apt-get install -y curl git nginx postgresql postgresql-contrib build-essential \
  certbot python3-certbot-nginx ufw

echo "==> Node.js 20"
if ! command -v node >/dev/null 2>&1 || ! node -v | grep -q '^v20'; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo npm install -g pm2

echo "==> UFW (22/80/443)"
sudo ufw allow OpenSSH || true
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
yes | sudo ufw enable || true

echo "==> PostgreSQL"
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';" || true
if ! sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'bungalov'" | grep -q 1; then
  sudo -u postgres createdb bungalov
fi

JWT_SECRET="$(openssl rand -hex 32)"

echo "==> Repo"
cd "$HOME"
if [ -d bungalov/.git ]; then
  cd bungalov && git fetch --depth 1 origin && git reset --hard origin/master
else
  rm -rf bungalov
  git clone --depth 1 "$REPO_URL" bungalov
  cd bungalov
fi

echo "==> backend/.env"
cat > backend/.env << EOF
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bungalov"
PORT=4000
JWT_SECRET="${JWT_SECRET}"
FRONTEND_URL="https://bungalov.savaskara.com,http://${PUBLIC_IP}"
BACKEND_URL="https://bungalov.savaskara.com"
IYZICO_ENABLED="false"
IYZICO_MODE="test"
IYZICO_API_KEY=""
IYZICO_SECRET_KEY=""
EOF

echo "==> frontend/.env.production"
cat > frontend/.env.production << EOF
NEXT_PUBLIC_SITE_URL="https://bungalov.savaskara.com"
NEXT_PUBLIC_API_URL="https://bungalov.savaskara.com/api"
EOF

echo "==> Backend build"
cd "$HOME/bungalov/backend"
npm ci
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run build

echo "==> Frontend build"
cd "$HOME/bungalov/frontend"
npm ci
# Düşük RAM'li VM'lerde lint/typecheck uzun sürebilir veya takılabilir
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build -- --no-lint

echo "==> PM2"
pm2 delete bungalov-backend 2>/dev/null || true
pm2 delete bungalov-frontend 2>/dev/null || true
pm2 start npm --name bungalov-backend --cwd "$HOME/bungalov/backend" -- run start:prod
pm2 start npm --name bungalov-frontend --cwd "$HOME/bungalov/frontend" -- run start
pm2 save
sudo env PATH="$PATH:/usr/bin" pm2 startup systemd -u ubuntu --hp /home/ubuntu || true

echo "==> Nginx"
sudo tee /etc/nginx/sites-available/bungalov >/dev/null << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name bungalov.savaskara.com NGINX_PUBLIC_IP;

    client_max_body_size 25M;

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
sudo sed -i "s/NGINX_PUBLIC_IP/${PUBLIC_IP}/" /etc/nginx/sites-available/bungalov
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/bungalov /etc/nginx/sites-enabled/bungalov
sudo nginx -t
sudo systemctl reload nginx

echo "==> Bitti. JWT_SECRET (backend/.env): ${JWT_SECRET:0:8}..."
echo "==> Admin: admin@savaskara.com / 123456"
