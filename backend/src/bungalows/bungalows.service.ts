import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBungalowDto } from './dto/create-bungalow.dto';
import { UpdateBungalowDto } from './dto/update-bungalow.dto';
import { SearchBungalowsDto } from './dto/search-bungalows.dto';

@Injectable()
export class BungalowsService {
  constructor(private readonly prisma: PrismaService) {}

  private getDateList(checkIn: Date, checkOut: Date): string[] {
    const dates: string[] = [];
    const cursor = new Date(checkIn);
    while (cursor < checkOut) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  private maxGuestsFromFeatures(features: Prisma.JsonValue): number {
    const data = (features ?? {}) as Record<string, unknown>;
    const parsed = Number(data.maxGuests ?? data.capacity ?? data.guestCount ?? 2);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2;
  }

  findAll() {
    return this.prisma.bungalow.findMany({
      include: { rooms: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async search(query: SearchBungalowsDto) {
    const checkIn = new Date(query.checkIn);
    const checkOut = new Date(query.checkOut);
    if (checkOut <= checkIn) return [];

    const nights = this.getDateList(checkIn, checkOut);
    if (!nights.length) return [];

    const bungalows = await this.prisma.bungalow.findMany({
      include: { rooms: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });

    const byCapacity = bungalows.filter(
      (bungalow) => this.maxGuestsFromFeatures(bungalow.features) >= query.guests,
    );
    if (!byCapacity.length) return [];

    const candidateIds = byCapacity.map((item) => item.id);
    const unavailableRows = await this.prisma.availability.findMany({
      where: {
        bungalowId: { in: candidateIds },
        date: { gte: checkIn, lt: checkOut },
        isAvailable: false,
      },
      select: { bungalowId: true, date: true },
    });
    const blockedFromAvailability = new Set(unavailableRows.map((row) => row.bungalowId));

    const overlappingReservations = await this.prisma.reservation.findMany({
      where: {
        bungalowId: { in: candidateIds },
        status: { not: ReservationStatus.cancelled },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
      select: { bungalowId: true },
    });
    const blockedFromReservations = new Set(overlappingReservations.map((row) => row.bungalowId));

    return byCapacity.filter(
      (bungalow) =>
        !blockedFromAvailability.has(bungalow.id) && !blockedFromReservations.has(bungalow.id),
    );
  }

  async findOne(id: string) {
    const bungalow = await this.prisma.bungalow.findUnique({
      where: { id },
      include: { rooms: { orderBy: { createdAt: 'desc' } } },
    });
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
