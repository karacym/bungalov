import { Injectable } from '@nestjs/common';
import { existsSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { Prisma, ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationsService } from '../reservations/reservations.service';
import { CreateAdminManualReservationDto } from '../reservations/dto/create-admin-manual-reservation.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reservationsService: ReservationsService,
  ) {}

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
    return this.prisma.bungalow.findMany({
      include: { rooms: { orderBy: { createdAt: 'desc' } } },
      orderBy: { createdAt: 'desc' },
    });
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

  createManualReservation(dto: CreateAdminManualReservationDto) {
    return this.reservationsService.createAdminManual(dto);
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

  listRooms(bungalowId: string) {
    return this.prisma.room.findMany({
      where: { bungalowId },
      orderBy: { createdAt: 'desc' },
    });
  }

  createRoom(
    bungalowId: string,
    data: {
      name: string;
      description: string;
      capacity: number;
      pricePerNight: number;
      images: string[];
      features: Record<string, unknown>;
    },
  ) {
    return this.prisma.room.create({
      data: {
        bungalowId,
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        pricePerNight: data.pricePerNight,
        images: data.images,
        features: data.features as Prisma.InputJsonValue,
      },
    });
  }

  updateRoom(
    id: string,
    data: Partial<{
      name: string;
      description: string;
      capacity: number;
      pricePerNight: number;
      images: string[];
      features: Record<string, unknown>;
    }>,
  ) {
    const { features, ...rest } = data;
    return this.prisma.room.update({
      where: { id },
      data: {
        ...rest,
        ...(features !== undefined && { features: features as Prisma.InputJsonValue }),
      },
    });
  }

  deleteRoom(id: string) {
    return this.prisma.room.delete({ where: { id } });
  }

  async getSettings() {
    const operations = await this.prisma.adminSetting.findUnique({
      where: { key: 'operations' },
    });
    return {
      operations: operations?.value ?? {},
    };
  }

  async upsertSettings(data: Record<string, unknown>) {
    const existing = await this.prisma.adminSetting.findUnique({
      where: { key: 'operations' },
    });
    const prev = (existing?.value as Record<string, unknown>) ?? {};
    const merged = { ...prev, ...data };
    await this.prisma.adminSetting.upsert({
      where: { key: 'operations' },
      update: {
        value: merged as Prisma.InputJsonValue,
      },
      create: {
        key: 'operations',
        value: merged as Prisma.InputJsonValue,
      },
    });
    return this.getSettings();
  }

  listPaymentProviders() {
    return this.prisma.paymentProviderSetting.findMany({
      orderBy: { provider: 'asc' },
    });
  }

  upsertPaymentProvider(
    provider: string,
    data: {
      enabled?: boolean;
      mode?: string;
      publicKey?: string | null;
      secretKey?: string | null;
      webhookSecret?: string | null;
      extra?: Record<string, unknown> | null;
    },
  ) {
    const updateData: Prisma.PaymentProviderSettingUpdateInput = {
      ...(data.enabled !== undefined && { enabled: data.enabled }),
      ...(data.mode !== undefined && { mode: data.mode }),
      ...(data.publicKey !== undefined && { publicKey: data.publicKey }),
      ...(data.secretKey !== undefined && { secretKey: data.secretKey }),
      ...(data.webhookSecret !== undefined && { webhookSecret: data.webhookSecret }),
      ...(data.extra !== undefined && {
        extra: data.extra === null ? Prisma.JsonNull : (data.extra as Prisma.InputJsonValue),
      }),
    };

    return this.prisma.paymentProviderSetting.upsert({
      where: { provider },
      update: updateData,
      create: {
        provider,
        enabled: data.enabled ?? false,
        mode: data.mode ?? 'test',
        publicKey: data.publicKey ?? null,
        secretKey: data.secretKey ?? null,
        webhookSecret: data.webhookSecret ?? null,
        extra: data.extra ? (data.extra as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  listMedia() {
    return this.prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  createMedia(data: {
    url: string;
    filename: string;
    mimeType: string;
    size: number;
  }) {
    return this.prisma.mediaAsset.create({
      data,
    });
  }

  async deleteMedia(id: string) {
    const asset = await this.prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return null;

    const frontendOrigins = (process.env.FRONTEND_URL ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const preferredOrigin =
      frontendOrigins.find((origin) => origin.includes(':3001')) ??
      frontendOrigins[0] ??
      'http://localhost:3001';
    const backendOrigin = preferredOrigin.replace(':3001', ':4000');

    const relativeUrl = asset.url;
    const absoluteUrl = `${backendOrigin}${relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`}`;
    const legacyAbsoluteUrl = `http://localhost:4000${relativeUrl.startsWith('/') ? relativeUrl : `/${relativeUrl}`}`;
    const toRemove = new Set([relativeUrl, absoluteUrl, legacyAbsoluteUrl]);

    const [bungalows, rooms] = await Promise.all([
      this.prisma.bungalow.findMany({
        where: {
          OR: Array.from(toRemove).map((url) => ({ images: { has: url } })),
        },
        select: { id: true, images: true },
      }),
      this.prisma.room.findMany({
        where: {
          OR: Array.from(toRemove).map((url) => ({ images: { has: url } })),
        },
        select: { id: true, images: true },
      }),
    ]);

    await this.prisma.$transaction([
      ...bungalows.map((bungalow) =>
        this.prisma.bungalow.update({
          where: { id: bungalow.id },
          data: {
            images: bungalow.images.filter((url) => !toRemove.has(url)),
          },
        }),
      ),
      ...rooms.map((room) =>
        this.prisma.room.update({
          where: { id: room.id },
          data: {
            images: room.images.filter((url) => !toRemove.has(url)),
          },
        }),
      ),
    ]);

    const uploadsDir = join(process.cwd(), 'uploads');
    const filePath = join(uploadsDir, asset.filename);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }

    await this.prisma.mediaAsset.delete({ where: { id } });
    return { ok: true };
  }
}
