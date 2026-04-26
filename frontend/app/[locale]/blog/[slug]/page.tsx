import { MarkdownBody } from '@/components/blog/markdown-body';
import { getBlogPost } from '@/lib/blog-api';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const post = await getBlogPost(params.slug, params.locale);
  if (!post) {
    const t = await getTranslations({ locale: params.locale, namespace: 'blog' });
    return { title: t('metaTitle') };
  }
  return {
    title: post.metaTitle,
    description: post.metaDesc,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDesc,
      type: 'article',
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const post = await getBlogPost(params.slug, params.locale);
  if (!post) notFound();

  const t = await getTranslations({ locale: params.locale, namespace: 'blog' });
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';
  const url = `${site}/${params.locale}/blog/${encodeURIComponent(post.slug)}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.metaDesc,
    datePublished: post.publishedAt ?? undefined,
    inLanguage: params.locale,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };

  return (
    <main className="bgl-container max-w-3xl py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="text-sm text-bgl-muted">
        <Link href={`/${params.locale}/blog`} className="font-medium text-bgl-moss hover:underline">
          {t('backToList')}
        </Link>
      </nav>
      <article itemScope itemType="https://schema.org/BlogPosting">
        <header className="mt-6">
          <h1 className="bgl-heading text-balance" itemProp="headline">
            {post.title}
          </h1>
          {post.publishedAt ? (
            <p className="mt-2 text-sm text-bgl-muted">
              <time dateTime={post.publishedAt} itemProp="datePublished">
                {new Date(post.publishedAt).toLocaleDateString(params.locale === 'ar' ? 'ar' : params.locale === 'en' ? 'en-GB' : 'tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            </p>
          ) : null}
          {post.excerpt ? (
            <p className="mt-4 text-sm leading-relaxed text-bgl-muted md:text-base" itemProp="description">
              {post.excerpt}
            </p>
          ) : null}
        </header>
        <div className="mt-10 border-t border-bgl-mist pt-10" itemProp="articleBody">
          <MarkdownBody markdown={post.body} />
        </div>
      </article>
    </main>
  );
}
