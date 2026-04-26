import { redirect } from 'next/navigation';
import { bungalowDetailPath, getBungalow } from '@/lib/api';

export default async function BungalowAliasPage({
  params,
  searchParams,
}: {
  params: { locale: string; id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const bungalow = await getBungalow(params.id);
  const query = new URLSearchParams();
  Object.entries(searchParams ?? {}).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        if (entry) query.append(key, entry);
      });
      return;
    }
    if (value) query.set(key, value);
  });

  const queryString = query.toString();
  const target = bungalow
    ? bungalowDetailPath(params.locale, bungalow)
    : `/${params.locale}/bungalows`;
  redirect(`${target}${queryString ? `?${queryString}` : ''}`);
}
