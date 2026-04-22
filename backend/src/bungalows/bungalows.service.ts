import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
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
    return this.prisma.bungalow.create({
      data: {
        ...dto,
        features: dto.features as Prisma.InputJsonValue,
      },
    });
  }

  async update(id: string, dto: UpdateBungalowDto) {
    await this.findOne(id);
    const { features, ...rest } = dto;
    return this.prisma.bungalow.update({
      where: { id },
      data: {
        ...rest,
        ...(features !== undefined && { features: features as Prisma.InputJsonValue }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.bungalow.delete({ where: { id } });
  }
}
