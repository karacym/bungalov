import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogPost, BlogPostStatus, Prisma } from '@prisma/client';
import { slugifyBungalowTitle } from '../bungalows/bungalow-slug.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogPostDto } from './dto/create-blog-post.dto';
import { UpdateBlogPostDto } from './dto/update-blog-post.dto';

type Locale = 'tr' | 'en' | 'ar';

function normLocale(raw?: string): Locale {
  if (raw === 'en' || raw === 'ar') return raw;
  return 'tr';
}

function pickPublic(post: BlogPost, locale: Locale) {
  const map = {
    tr: {
      title: post.titleTr,
      excerpt: post.excerptTr,
      body: post.bodyTr,
      metaTitle: post.metaTitleTr ?? post.titleTr,
      metaDesc: post.metaDescTr ?? post.excerptTr,
    },
    en: {
      title: post.titleEn,
      excerpt: post.excerptEn,
      body: post.bodyEn,
      metaTitle: post.metaTitleEn ?? post.titleEn,
      metaDesc: post.metaDescEn ?? post.excerptEn,
    },
    ar: {
      title: post.titleAr,
      excerpt: post.excerptAr,
      body: post.bodyAr,
      metaTitle: post.metaTitleAr ?? post.titleAr,
      metaDesc: post.metaDescAr ?? post.excerptAr,
    },
  } as const;
  return { slug: post.slug, publishedAt: post.publishedAt, ...map[locale] };
}

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  private async uniqueSlug(base: string, excludeId?: string): Promise<string> {
    const root = slugifyBungalowTitle(base).slice(0, 72) || 'yazi';
    for (let i = 0; i < 10_000; i += 1) {
      const candidate = i === 0 ? root : `${root}-${i}`;
      const found = await this.prisma.blogPost.findFirst({
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

  private dataFromDto(dto: CreateBlogPostDto | UpdateBlogPostDto): Prisma.BlogPostUncheckedUpdateInput {
    const publishedAt =
      dto.publishedAt !== undefined
        ? dto.publishedAt
          ? new Date(dto.publishedAt)
          : null
        : undefined;
    return {
      ...(dto.status !== undefined && { status: dto.status }),
      ...(publishedAt !== undefined && { publishedAt }),
      ...(dto.titleTr !== undefined && { titleTr: dto.titleTr }),
      ...(dto.titleEn !== undefined && { titleEn: dto.titleEn }),
      ...(dto.titleAr !== undefined && { titleAr: dto.titleAr }),
      ...(dto.excerptTr !== undefined && { excerptTr: dto.excerptTr }),
      ...(dto.excerptEn !== undefined && { excerptEn: dto.excerptEn }),
      ...(dto.excerptAr !== undefined && { excerptAr: dto.excerptAr }),
      ...(dto.bodyTr !== undefined && { bodyTr: dto.bodyTr }),
      ...(dto.bodyEn !== undefined && { bodyEn: dto.bodyEn }),
      ...(dto.bodyAr !== undefined && { bodyAr: dto.bodyAr }),
      ...(dto.metaTitleTr !== undefined && { metaTitleTr: dto.metaTitleTr }),
      ...(dto.metaTitleEn !== undefined && { metaTitleEn: dto.metaTitleEn }),
      ...(dto.metaTitleAr !== undefined && { metaTitleAr: dto.metaTitleAr }),
      ...(dto.metaDescTr !== undefined && { metaDescTr: dto.metaDescTr }),
      ...(dto.metaDescEn !== undefined && { metaDescEn: dto.metaDescEn }),
      ...(dto.metaDescAr !== undefined && { metaDescAr: dto.metaDescAr }),
    };
  }

  async listPublished(locale?: string) {
    const loc = normLocale(locale);
    const rows = await this.prisma.blogPost.findMany({
      where: { status: BlogPostStatus.published },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
    });
    return rows.map((p) => {
      const { title, excerpt } = pickPublic(p, loc);
      return {
        slug: p.slug,
        title,
        excerpt,
        publishedAt: p.publishedAt?.toISOString() ?? null,
      };
    });
  }

  async getPublishedBySlug(slug: string, locale?: string) {
    const loc = normLocale(locale);
    const post = await this.prisma.blogPost.findUnique({ where: { slug } });
    if (!post || post.status !== BlogPostStatus.published) {
      throw new NotFoundException('Post not found');
    }
    return pickPublic(post, loc);
  }

  async listAllAdmin() {
    return this.prisma.blogPost.findMany({
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async create(dto: CreateBlogPostDto) {
    const slug = dto.slug?.trim()
      ? await this.uniqueSlug(dto.slug.trim())
      : await this.uniqueSlug(dto.titleTr);
    const publishedAt =
      dto.status === BlogPostStatus.published
        ? dto.publishedAt
          ? new Date(dto.publishedAt)
          : new Date()
        : null;
    return this.prisma.blogPost.create({
      data: {
        slug,
        status: dto.status,
        publishedAt,
        titleTr: dto.titleTr,
        titleEn: dto.titleEn,
        titleAr: dto.titleAr,
        excerptTr: dto.excerptTr,
        excerptEn: dto.excerptEn,
        excerptAr: dto.excerptAr,
        bodyTr: dto.bodyTr,
        bodyEn: dto.bodyEn,
        bodyAr: dto.bodyAr,
        metaTitleTr: dto.metaTitleTr ?? null,
        metaTitleEn: dto.metaTitleEn ?? null,
        metaTitleAr: dto.metaTitleAr ?? null,
        metaDescTr: dto.metaDescTr ?? null,
        metaDescEn: dto.metaDescEn ?? null,
        metaDescAr: dto.metaDescAr ?? null,
      },
    });
  }

  async update(id: string, dto: UpdateBlogPostDto) {
    await this.prisma.blogPost.findUniqueOrThrow({ where: { id } });
    const data = this.dataFromDto(dto) as Prisma.BlogPostUncheckedUpdateInput;
    if (dto.slug !== undefined && dto.slug.trim()) {
      data.slug = await this.uniqueSlug(dto.slug.trim(), id);
    }
    if (dto.status === BlogPostStatus.published && dto.publishedAt === undefined) {
      const cur = await this.prisma.blogPost.findUnique({ where: { id } });
      if (cur && !cur.publishedAt) {
        data.publishedAt = new Date();
      }
    }
    return this.prisma.blogPost.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.prisma.blogPost.findUniqueOrThrow({ where: { id } });
    return this.prisma.blogPost.delete({ where: { id } });
  }
}
