const { PrismaClient } = require('../backend/node_modules/@prisma/client');

async function main() {
  const prisma = new PrismaClient();
  try {
    const rows = await prisma.blogPost.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    process.stdout.write(JSON.stringify(rows));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
