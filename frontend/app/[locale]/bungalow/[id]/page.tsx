import { redirect } from 'next/navigation';

export default function BungalowAliasPage({
  params,
  searchParams,
}: {
  params: { locale: string; id: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
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
  redirect(
    `/${params.locale}/bungalows/${params.id}${queryString ? `?${queryString}` : ''}`,
  );
}
