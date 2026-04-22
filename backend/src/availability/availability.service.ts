import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AvailabilityService {
  constructor(private readonly prisma: PrismaService) {}

  list(bungalowId: string) {
    return this.prisma.availability.findMany({
      where: { bungalowId },
      orderBy: { date: 'asc' },
    });
  }

  update(bungalowId: string, date: string, isAvailable: boolean) {
    return this.prisma.availability.upsert({
      where: { bungalowId_date: { bungalowId, date: new Date(date) } },
      update: { isAvailable },
      create: { bungalowId, date: new Date(date), isAvailable },
    });
  }
}
