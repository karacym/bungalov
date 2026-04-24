import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateGuestReservationDto } from './dto/create-guest-reservation.dto';
import { CreateAdminManualReservationDto } from './dto/create-admin-manual-reservation.dto';

type CreateForUserOptions = {
  allowPastCheckIn?: boolean;
  initialStatus?: ReservationStatus;
};

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  private maxGuestsFromFeatures(features: unknown): number {
    const data = (features ?? {}) as Record<string, unknown>;
    const parsed = Number(data.maxGuests ?? data.capacity ?? data.guestCount ?? 2);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 2;
  }

  /** YYYY-MM-DD veya ISO; takvim gununu sunucunun yerel saat diliminde yorumlar. */
  private parseDateOnly(value: string): Date {
    const trimmed = value.trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
    if (!m) {
      const d = new Date(trimmed);
      if (Number.isNaN(d.getTime())) {
        throw new BadRequestException('Invalid date');
      }
      return d;
    }
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const day = Number(m[3]);
    return new Date(y, mo - 1, day);
  }

  private startOfTodayLocal(): Date {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), n.getDate());
  }

  private async resolveGuestUser(guestEmail: string, guestName: string) {
    const email = guestEmail.trim().toLowerCase();
    const name = guestName.trim();
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: name || 'Misafir',
          email,
          password: `guest-${randomUUID()}`,
        },
      });
    }
    return user;
  }

  async create(userId: string, dto: CreateReservationDto) {
    return this.createForUser(userId, dto);
  }

  async createGuest(dto: CreateGuestReservationDto) {
    const user = await this.resolveGuestUser(dto.guestEmail, dto.guestName);
    return this.createForUser(user.id, {
      bungalowId: dto.bungalowId,
      checkIn: dto.checkIn,
      checkOut: dto.checkOut,
      guests: dto.guests,
    });
  }

  /** Admin: gecmis giris tarihleri dahil manuel kayit (odeme kaydi olusturmaz). */
  async createAdminManual(dto: CreateAdminManualReservationDto) {
    const user = await this.resolveGuestUser(dto.guestEmail, dto.guestName);
    return this.createForUser(
      user.id,
      {
        bungalowId: dto.bungalowId,
        checkIn: dto.checkIn,
        checkOut: dto.checkOut,
        guests: dto.guests,
      },
      {
        allowPastCheckIn: true,
        initialStatus: dto.status ?? ReservationStatus.paid,
      },
    );
  }

  private async createForUser(
    userId: string,
    dto: Pick<CreateReservationDto, 'bungalowId' | 'checkIn' | 'checkOut' | 'guests'>,
    options?: CreateForUserOptions,
  ) {
    const checkIn = this.parseDateOnly(dto.checkIn);
    const checkOut = this.parseDateOnly(dto.checkOut);

    if (checkOut <= checkIn) {
      throw new BadRequestException('Check-out must be after check-in');
    }

    if (!options?.allowPastCheckIn) {
      const todayStart = this.startOfTodayLocal();
      if (checkIn < todayStart) {
        throw new BadRequestException('Giris tarihi bugunden once olamaz');
      }
    }

    const bungalow = await this.prisma.bungalow.findUnique({ where: { id: dto.bungalowId } });
    if (!bungalow) {
      throw new NotFoundException('Bungalow not found');
    }
    const requestedGuests = dto.guests ?? 1;
    const maxGuests = this.maxGuestsFromFeatures(bungalow.features);
    if (requestedGuests > maxGuests) {
      throw new BadRequestException('Requested guest count exceeds bungalow capacity');
    }

    const overlap = await this.prisma.reservation.findFirst({
      where: {
        bungalowId: dto.bungalowId,
        status: { not: ReservationStatus.cancelled },
        checkIn: { lt: checkOut },
        checkOut: { gt: checkIn },
      },
    });

    if (overlap) {
      throw new BadRequestException('Selected dates are not available');
    }

    const oneDay = 1000 * 60 * 60 * 24;
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / oneDay);
    const totalPrice = Number(bungalow.pricePerNight) * nights;

    const status = options?.initialStatus ?? ReservationStatus.pending;

    return this.prisma.reservation.create({
      data: {
        userId,
        bungalowId: dto.bungalowId,
        checkIn,
        checkOut,
        guests: dto.guests ?? 1,
        totalPrice,
        status,
      },
      include: {
        user: true,
        bungalow: true,
        payment: true,
      },
    });
  }

  findAll() {
    return this.prisma.reservation.findMany({
      include: {
        user: true,
        bungalow: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: ReservationStatus) {
    const reservation = await this.prisma.reservation.findUnique({ where: { id } });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    return this.prisma.reservation.update({ where: { id }, data: { status } });
  }
}
