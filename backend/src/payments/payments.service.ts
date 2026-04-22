import { Injectable, NotFoundException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async initiate(dto: InitiatePaymentDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const payment = await this.prisma.payment.create({
      data: {
        reservationId: reservation.id,
        amount: dto.amount,
        status: 'initiated',
        provider: 'iyzico',
      },
    });

    return {
      paymentId: payment.id,
      provider: payment.provider,
      redirectUrl: `https://sandbox-iyzico.example/checkout/${payment.id}`,
      message: 'Modular iyzico structure ready. Replace redirect URL with real integration.',
    };
  }

  async callback(dto: PaymentCallbackDto) {
    const payment = await this.prisma.payment.findUnique({
      where: { reservationId: dto.reservationId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    const isSuccess = dto.paymentStatus.toLowerCase() === 'success';

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: dto.paymentStatus },
    });

    await this.prisma.reservation.update({
      where: { id: dto.reservationId },
      data: {
        status: isSuccess ? ReservationStatus.paid : ReservationStatus.cancelled,
      },
    });

    return { ok: true };
  }
}
