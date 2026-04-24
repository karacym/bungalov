-- pgAdmin: PostgreSQL sunucusuna baglan -> postgres kullanicisi -> Query Tool
-- Bu script .env ornegindeki sifre ile uyumludur: postgres / postgres

ALTER USER postgres WITH PASSWORD 'postgres';

-- Veritabani zaten varsa hata verebilir; o zaman sadece sifre adimi yeterli
CREATE DATABASE bungalov;
