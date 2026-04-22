import { Injectable } from '@nestjs/common';
import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async stats() {
    const [users, bungalows, reservations, paidReservations] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.bungalow.count(),
      this.prisma.reservation.count(),
      this.prisma.reservation.count({ where: { status: ReservationStatus.paid } }),
    ]);

    return { users, bungalows, reservations, paidReservations };
  }

  listBungalows() {
    return this.prisma.bungalow.findMany({ orderBy: { createdAt: 'desc' } });
  }

  createBungalow(data: {
    title: string;
    description: string;
    pricePerNight: number;
    location: string;
    images: string[];
    features: Record<string, unknown>;
  }) {
    return this.prisma.bungalow.create({
      data: {
        ...data,
        features: data.features as Prisma.InputJsonValue,
      },
    });
  }

  updateBungalow(
    id: string,
    data: Partial<{
      title: string;
      description: string;
      pricePerNight: number;
      location: string;
      images: string[];
      features: Record<string, unknown>;
    }>,
  ) {
    const { features, ...rest } = data;
    return this.prisma.bungalow.update({
      where: { id },
      data: {
        ...rest,
        ...(features !== undefined && { features: features as Prisma.InputJsonValue }),
      },
    });
  }

  deleteBungalow(id: string) {
    return this.prisma.bungalow.delete({ where: { id } });
  }

  async listReservations(params?: {
    page?: number;
    limit?: number;
    status?: ReservationStatus;
    search?: string;
  }) {
    const page = Math.max(params?.page ?? 1, 1);
    const limit = Math.min(Math.max(params?.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;
    const search = params?.search?.trim();
    const status = params?.status;

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { user: { email: { contains: search, mode: 'insensitive' as const } } },
              { bungalow: { title: { contains: search, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.reservation.findMany({
        where,
        include: { user: true, bungalow: true, payment: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.reservation.count({ where }),
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.max(Math.ceil(total / limit), 1),
      },
    };
  }

  updateReservationStatus(id: string, status: ReservationStatus) {
    return this.prisma.reservation.update({ where: { id }, data: { status } });
  }

  listAvailability(bungalowId: string) {
    return this.prisma.availability.findMany({
      where: { bungalowId },
      orderBy: { date: 'asc' },
    });
  }

  updateAvailability(bungalowId: string, date: string, isAvailable: boolean) {
    return this.prisma.availability.upsert({
      where: { bungalowId_date: { bungalowId, date: new Date(date) } },
      update: { isAvailable },
      create: { bungalowId, date: new Date(date), isAvailable },
    });
  }

  listTranslations() {
    return this.prisma.translation.findMany({ orderBy: { key: 'asc' } });
  }

  upsertTranslation(data: { key: string; tr: string; en: string; ar: string }) {
    return this.prisma.translation.upsert({
      where: { key: data.key },
      update: data,
      create: data,
    });
  }
}
