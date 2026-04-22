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

### Ilk veri (seed)
- Deploy sonrasi `startCommand` icinde `prisma db seed` calisir.
- Admin: `admin@savaskara.com` / `123456`
- Demo kullanici: `misafir@savaskara.com` / `123456`
- Bos veritabaninda 3 demo bungalov ve 60 gunluk musaitlik kaydi olusturulur.

### Deploy basarisiz olursa
- `bungalov-backend` → **Logs** veya **Events** sekmesinden son 50 satiri kopyala (build mi runtime mi netlesir).
- Uygulama `PORT` ortam degiskenini Render atar; sabit port kullanma.
- Dinleme adresi: `0.0.0.0` (kodda ayarli).
- `prisma db push` build asamasinda calismaz (Render build ortaminda DB baglantisi bazen basarisiz olur); sema senkronu **start** sirasinda yapilir.
- Build sirasinda `NODE_ENV=production` iken `npm install` bazen `devDependencies` yuklemez; `render.yaml` icinde `NPM_CONFIG_PRODUCTION=false` ile TypeScript ve `@types/*` paketleri yuklenir.
