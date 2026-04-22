import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReservationDto) {
    const checkIn = new Date(dto.checkIn);
    const checkOut = new Date(dto.checkOut);

    if (checkOut <= checkIn) {
      throw new BadRequestException('Check-out must be after check-in');
    }

    const bungalow = await this.prisma.bungalow.findUnique({ where: { id: dto.bungalowId } });
    if (!bungalow) {
      throw new NotFoundException('Bungalow not found');
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

    return this.prisma.reservation.create({
      data: {
        userId,
        bungalowId: dto.bungalowId,
        checkIn,
        checkOut,
        totalPrice,
      },
      include: {
        bungalow: true,
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
