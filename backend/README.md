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
- BACKEND_URL
- IYZICO_ENABLED
- IYZICO_MODE
- IYZICO_API_KEY
- IYZICO_SECRET_KEY

## Iyzico Sandbox Odeme
Gercek odeme akisina en yakin test icin Iyzico sandbox kullanilir.

1. Iyzico sandbox hesabindan API anahtarlarini al.
2. `.env` icine su alanlari doldur:
   - `IYZICO_ENABLED=true`
   - `IYZICO_MODE=test`
   - `IYZICO_API_KEY=...`
   - `IYZICO_SECRET_KEY=...`
   - `BACKEND_URL=http://localhost:4000`
3. Frontendde rezervasyon adiminda `Simdi Ode` ile islem baslat.
4. Sistem Iyzico checkout sayfasina yonlendirir.
5. Odeme sonucu callback ile reservation/payment kayitlari otomatik guncellenir.

## Windows / Yerel PostgreSQL (P1000 sifre hatasi)
1. **pgAdmin** ile `localhost` sunucusuna baglan (kurulumda belirledigin `postgres` sifresi).
2. **Query Tool** acip `scripts/init-bungalov-db.sql` dosyasini calistir (sifreyi `postgres` yapar, `bungalov` veritabanini olusturur). `CREATE DATABASE` zaten varsa hatayi yoksay.
3. `.env` icinde `DATABASE_URL` bu sifreyle uyumlu olsun: `postgresql://postgres:postgres@localhost:5432/bungalov`
4. Tek komut: `npm run db:setup` (generate + push + seed).

### Docker (istege bagli, 5433 portu)
Makinede Docker varsa ve yerel 5432 sifresini degistirmek istemiyorsan: `cd backend && npm run db:docker` sonra `.env` icinde `...@localhost:5433/bungalov` kullan, ardindan `npm run db:setup`.

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
