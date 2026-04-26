import { getApiBaseUrl } from '@/lib/api';

export type BlogListItem = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
};

export type BlogPostDetail = {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  metaTitle: string;
  metaDesc: string;
  publishedAt: string | null;
};

export async function getBlogPosts(locale: string): Promise<BlogListItem[]> {
  try {
    const res = await fetch(
      `${getApiBaseUrl()}/blog/posts?locale=${encodeURIComponent(locale)}`,
      { next: { revalidate: 120 } },
    );
    if (!res.ok) return [];
    const data = (await res.json()) as BlogListItem[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string, locale: string): Promise<BlogPostDetail | null> {
  try {
    const res = await fetch(
      `${getApiBaseUrl()}/blog/posts/${encodeURIComponent(slug)}?locale=${encodeURIComponent(locale)}`,
      { next: { revalidate: 120 } },
    );
    if (!res.ok) return null;
    return (await res.json()) as BlogPostDetail;
  } catch {
    return null;
  }
}
