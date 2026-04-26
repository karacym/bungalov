import { PrismaClient } from '@prisma/client';

const TR_ASCII: Record<string, string> = {
  ğ: 'g',
  ü: 'u',
  ş: 's',
  ı: 'i',
  i: 'i',
  ö: 'o',
  ç: 'c',
  Ğ: 'g',
  Ü: 'u',
  Ş: 's',
  İ: 'i',
  Ö: 'o',
  Ç: 'c',
};

/** Basliktan URL-uyumlu tek parca slug (Türkce karakterler düzlestirilir). */
export function slugifyBungalowTitle(title: string): string {
  let s = title.trim();
  for (const [k, v] of Object.entries(TR_ASCII)) {
    s = s.split(k).join(v);
  }
  s = s
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return s || 'bungalov';
}

/** Ayni tabanda cakisma olmayana kadar `-1`, `-2` ... ekler. */
export async function uniqueBungalowSlug(
  db: PrismaClient,
  title: string,
  excludeId?: string,
): Promise<string> {
  const root = slugifyBungalowTitle(title).slice(0, 72) || 'bungalov';
  for (let i = 0; i < 10_000; i += 1) {
    const candidate = i === 0 ? root : `${root}-${i}`;
    const found = await db.bungalow.findFirst({
      where: {
        slug: candidate,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
      select: { id: true },
    });
    if (!found) return candidate;
  }
  return `${root}-${Date.now().toString(36)}`;
}
