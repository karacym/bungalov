#!/usr/bin/env bash
# Canli sunucuyu gunceller: git pull, Prisma db push, seed, build, PM2.
# Once GitHub'a push yapilmis olmali (sunucu: git reset --hard origin/master).
#
# Kullanim (Git Bash / WSL / Linux):
#   chmod +x scripts/deploy-live-ssh.sh
#   BUNGALOV_SSH=ubuntu@SUNUCU_IP ./scripts/deploy-live-ssh.sh
#
# Varsayilan hedef (scripts/remote-bootstrap-ubuntu.sh ile uyumlu):
#   ubuntu@80.225.240.253
set -euo pipefail

SSH_TARGET="${BUNGALOV_SSH:-ubuntu@80.225.240.253}"
echo "==> SSH: ${SSH_TARGET}"
echo "==> Uzak komutlar basliyor..."

ssh -o ConnectTimeout=20 "${SSH_TARGET}" bash << 'REMOTE'
set -euo pipefail
REPO="${HOME}/bungalov"
if [ ! -d "${REPO}/.git" ]; then
  echo "Hata: ${REPO} bulunamadi veya git repo degil."
  exit 1
fi

cd "${REPO}"
echo "==> Git: origin/master"
git fetch --depth 1 origin
git reset --hard origin/master

echo "==> Backend: npm ci + prisma + build"
cd "${REPO}/backend"
npm ci
npx prisma generate
npx prisma db push --accept-data-loss
npm run prisma:seed
npm run build

echo "==> Frontend: npm ci + build"
cd "${REPO}/frontend"
npm ci
export NODE_OPTIONS="--max-old-space-size=2048"
npm run build -- --no-lint

echo "==> PM2"
if pm2 describe bungalov-backend >/dev/null 2>&1 && pm2 describe bungalov-frontend >/dev/null 2>&1; then
  pm2 restart bungalov-backend bungalov-frontend --update-env
else
  pm2 delete bungalov-backend 2>/dev/null || true
  pm2 delete bungalov-frontend 2>/dev/null || true
  pm2 start npm --name bungalov-backend --cwd "${REPO}/backend" -- run start:prod
  pm2 start npm --name bungalov-frontend --cwd "${REPO}/frontend" -- run start
  pm2 save
fi

echo "==> Canli guncelleme tamam."
REMOTE
