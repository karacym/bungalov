import { getBlogPosts } from '@/lib/blog-api';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale: params.locale, namespace: 'blog' });
  return {
    title: t('metaTitle'),
    description: t('metaDescription'),
  };
}

export default async function BlogPage({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'blog' });
  const posts = await getBlogPosts(params.locale);

  return (
    <main className="bgl-container max-w-3xl py-12 md:py-16">
      <p className="bgl-section-title">{t('eyebrow')}</p>
      <h1 className="bgl-heading mt-2">{t('title')}</h1>
      <p className="mt-4 text-sm leading-relaxed text-bgl-muted md:text-base">{t('intro')}</p>

      <section className="mt-12 space-y-6" aria-labelledby="blog-posts-heading">
        <h2 id="blog-posts-heading" className="sr-only">
          {t('postsHeading')}
        </h2>
        {posts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-bgl-mist bg-bgl-cream/40 p-6 text-sm text-bgl-muted">{t('emptyList')}</p>
        ) : (
          posts.map((post) => (
            <article key={post.slug} className="bgl-card p-6 md:p-8">
              <h3 className="text-lg font-semibold text-bgl-ink">
                <Link href={`/${params.locale}/blog/${encodeURIComponent(post.slug)}`} className="hover:text-bgl-moss hover:underline">
                  {post.title}
                </Link>
              </h3>
              {post.publishedAt ? (
                <p className="mt-1 text-xs text-bgl-muted">
                  {new Date(post.publishedAt).toLocaleDateString(
                    params.locale === 'ar' ? 'ar' : params.locale === 'en' ? 'en-GB' : 'tr-TR',
                    { year: 'numeric', month: 'short', day: 'numeric' },
                  )}
                </p>
              ) : null}
              {post.excerpt ? <p className="mt-2 text-sm leading-relaxed text-bgl-muted">{post.excerpt}</p> : null}
              <p className="mt-4">
                <Link
                  href={`/${params.locale}/blog/${encodeURIComponent(post.slug)}`}
                  className="text-sm font-semibold text-bgl-moss hover:underline"
                >
                  {t('readMore')}
                </Link>
              </p>
            </article>
          ))
        )}
      </section>
    </main>
  );
}
