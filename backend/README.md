# Bungalov Backend (NestJS + Prisma)

## Kurulum
1. `npm install`
2. `.env.example` dosyasini `.env` olarak kopyala
3. `npm run prisma:generate`
4. `npm run prisma:migrate`
5. `npm run start:dev`

## Ortam Degiskenleri
- DATABASE_URL
- PORT
- JWT_SECRET
- FRONTEND_URL

## API Prefix
Tum endpointler ` /api ` prefix'i ile calisir.

## Swagger
- Dokumantasyon: `/api/docs`

## Admin Reservations Query
- `GET /api/admin/reservations?page=1&limit=10`
- Opsiyonel filtreler: `status=pending|paid|cancelled`, `search=<email veya bungalow>`

## Render Deploy
- Repo kokundeki `render.yaml` dosyasi ile Blueprint olustur.
- Servis: `bungalov-backend`
- Veritabani: `bungalov-db` (PostgreSQL)
- Deploy sonrasi API URL formati: `https://<render-servis-adi>.onrender.com/api`
