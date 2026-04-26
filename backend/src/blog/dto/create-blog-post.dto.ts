import { BlogPostStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBlogPostDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  slug?: string;

  @IsEnum(BlogPostStatus)
  status!: BlogPostStatus;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(220)
  titleTr!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(220)
  titleEn!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(220)
  titleAr!: string;

  @IsString()
  @MaxLength(2000)
  excerptTr: string = '';

  @IsString()
  @MaxLength(2000)
  excerptEn: string = '';

  @IsString()
  @MaxLength(2000)
  excerptAr: string = '';

  @IsString()
  @MinLength(1)
  bodyTr!: string;

  @IsString()
  @MinLength(1)
  bodyEn!: string;

  @IsString()
  @MinLength(1)
  bodyAr!: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  metaTitleTr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  metaTitleEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(220)
  metaTitleAr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescTr?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescEn?: string;

  @IsOptional()
  @IsString()
  @MaxLength(320)
  metaDescAr?: string;
}
