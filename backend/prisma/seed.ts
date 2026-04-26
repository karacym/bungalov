import { randomUUID } from 'node:crypto';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { uniqueBungalowSlug } from '../src/bungalows/bungalow-slug.util';

const prisma = new PrismaClient();

const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80',
  'https://images.unsplash.com/photo-1518780664699-7e3d4ca20947?w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
];

async function main() {
  const adminPassword = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@savaskara.com' },
    update: { password: adminPassword, role: UserRole.admin, name: 'Yonetici' },
    create: {
      email: 'admin@savaskara.com',
      name: 'Yonetici',
      password: adminPassword,
      role: UserRole.admin,
    },
  });

  const demoUserPassword = await bcrypt.hash('123456', 10);
  await prisma.user.upsert({
    where: { email: 'misafir@savaskara.com' },
    update: {},
    create: {
      email: 'misafir@savaskara.com',
      name: 'Misafir',
      password: demoUserPassword,
      role: UserRole.user,
    },
  });

  await prisma.user.upsert({
    where: { email: 'channel-sync@internal.bungalov' },
    update: { name: 'Airbnb Takvim' },
    create: {
      email: 'channel-sync@internal.bungalov',
      name: 'Airbnb Takvim',
      password: `channel-${randomUUID()}`,
      role: UserRole.user,
    },
  });

  const existing = await prisma.bungalow.count();
  if (existing === 0) {
    const t1 = 'Gol Kenari Premium Bungalov';
    const t2 = 'Orman Evi Bungalov';
    const t3 = 'Dag Manzarali Suite';
    const slug1 = await uniqueBungalowSlug(prisma, t1);
    const slug2 = await uniqueBungalowSlug(prisma, t2);
    const slug3 = await uniqueBungalowSlug(prisma, t3);
    const b1 = await prisma.bungalow.create({
      data: {
        slug: slug1,
        icalExportToken: randomUUID(),
        title: t1,
        description:
          'Dogayla ic ice, genis veranda ve jakuzili modern bungalov. Sabah kahvaltisi dahildir.',
        pricePerNight: 4500,
        location: 'Sapanca, Sakarya',
        images: DEMO_IMAGES,
        features: { wifi: true, jakuzi: true, kahvalti: true, maxMisafir: 4 },
      },
    });
    const b2 = await prisma.bungalow.create({
      data: {
        slug: slug2,
        title: t2,
        description:
          'Cam agaclarinin altinda sessiz konaklama. Barbeku alani ve yangin cemberi.',
        pricePerNight: 3200,
        location: 'Abant, Bolu',
        images: [DEMO_IMAGES[1], DEMO_IMAGES[0]],
        features: { wifi: true, barbeku: true, maxMisafir: 6 },
      },
    });
    const b3 = await prisma.bungalow.create({
      data: {
        slug: slug3,
        icalExportToken: randomUUID(),
        title: t3,
        description: 'Genis cam cephe ve panoramik dag manzarasi. Balayi icin ideal.',
        pricePerNight: 5800,
        location: 'Uludag, Bursa',
        images: [DEMO_IMAGES[2], DEMO_IMAGES[1], DEMO_IMAGES[0]],
        features: { wifi: true, somine: true, maxMisafir: 2 },
      },
    });

    const start = new Date();
    start.setUTCHours(12, 0, 0, 0);
    for (const bungalow of [b1, b2, b3]) {
      await prisma.room.createMany({
        data: [
          {
            bungalowId: bungalow.id,
            name: 'Standart Oda',
            description: 'Bahce manzarali, cift kisilik yatakli.',
            capacity: 2,
            pricePerNight: 0,
            images: bungalow.images,
            features: { klima: true, minibar: true },
          },
          {
            bungalowId: bungalow.id,
            name: 'Aile Odasi',
            description: 'Ek yatakli, cocuklu aileler icin uygun.',
            capacity: 4,
            pricePerNight: 0,
            images: bungalow.images,
            features: { klima: true, cocukYatagi: true },
          },
        ],
      });

      for (let d = 0; d < 60; d++) {
        const date = new Date(start);
        date.setUTCDate(date.getUTCDate() + d);
        await prisma.availability.create({
          data: { bungalowId: bungalow.id, date, isAvailable: true },
        });
      }
    }
  }

  const allBungalows = await prisma.bungalow.findMany({ select: { id: true, images: true } });
  for (const bungalow of allBungalows) {
    const roomCount = await prisma.room.count({ where: { bungalowId: bungalow.id } });
    if (roomCount === 0) {
      await prisma.room.create({
        data: {
          bungalowId: bungalow.id,
          name: 'Standart Oda',
          description: 'Varsayilan oda kaydi',
          capacity: 2,
          pricePerNight: 0,
          images: bungalow.images,
          features: { klima: true },
        },
      });
    }
  }

  const translations = [
    { key: 'nav.bungalows', tr: 'Bungalovlar', en: 'Bungalows', ar: 'الاكواخ' },
    { key: 'footer.rights', tr: 'Tum haklari saklidir.', en: 'All rights reserved.', ar: 'جميع الحقوق محفوظة.' },
  ];
  for (const row of translations) {
    await prisma.translation.upsert({
      where: { key: row.key },
      update: { tr: row.tr, en: row.en, ar: row.ar },
      create: row,
    });
  }

  await prisma.adminSetting.upsert({
    where: { key: 'operations' },
    update: {
      value: {
        logoUrl: '',
        supportPhone: '',
        supportEmail: '',
        mapEmbedUrl: '',
        googlePlaceId: '',
        checkInTime: '14:00',
        checkOutTime: '11:00',
      },
    },
    create: {
      key: 'operations',
      value: {
        logoUrl: '',
        supportPhone: '',
        supportEmail: '',
        mapEmbedUrl: '',
        googlePlaceId: '',
        checkInTime: '14:00',
        checkOutTime: '11:00',
      },
    },
  });

  for (const provider of ['iyzico', 'stripe', 'paytr']) {
    await prisma.paymentProviderSetting.upsert({
      where: { provider },
      update: {},
      create: {
        provider,
        enabled: provider === 'iyzico',
        mode: 'test',
      },
    });
  }

  await prisma.emailSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' },
  });

  const missingSlug = await prisma.bungalow.findMany({
    where: { slug: null },
    select: { id: true, title: true },
  });
  for (const row of missingSlug) {
    const slug = await uniqueBungalowSlug(prisma, row.title, row.id);
    await prisma.bungalow.update({ where: { id: row.id }, data: { slug } });
  }

  const missingIcal = await prisma.bungalow.findMany({
    where: { icalExportToken: null },
    select: { id: true },
  });
  for (const row of missingIcal) {
    await prisma.bungalow.update({
      where: { id: row.id },
      data: { icalExportToken: randomUUID() },
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
