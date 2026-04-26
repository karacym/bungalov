import { Controller, Get, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  listPublished(@Query('locale') locale?: string) {
    return this.blogService.listPublished(locale);
  }

  @Get('posts/:slug')
  getPublished(@Param('slug') slug: string, @Query('locale') locale?: string) {
    return this.blogService.getPublishedBySlug(slug, locale);
  }
}
