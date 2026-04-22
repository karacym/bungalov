import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TranslationsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.translation.findMany({ orderBy: { key: 'asc' } });
  }

  upsert(body: { key: string; tr: string; en: string; ar: string }) {
    return this.prisma.translation.upsert({
      where: { key: body.key },
      update: body,
      create: body,
    });
  }
}
