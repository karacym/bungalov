import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBungalowDto } from './dto/create-bungalow.dto';
import { UpdateBungalowDto } from './dto/update-bungalow.dto';

@Injectable()
export class BungalowsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.bungalow.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const bungalow = await this.prisma.bungalow.findUnique({ where: { id } });
    if (!bungalow) {
      throw new NotFoundException('Bungalow not found');
    }
    return bungalow;
  }

  create(dto: CreateBungalowDto) {
    return this.prisma.bungalow.create({ data: dto });
  }

  async update(id: string, dto: UpdateBungalowDto) {
    await this.findOne(id);
    return this.prisma.bungalow.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.bungalow.delete({ where: { id } });
  }
}
