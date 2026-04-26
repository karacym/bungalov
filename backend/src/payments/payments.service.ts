import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import Iyzipay = require('iyzipay');
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';

type IyzicoConfig = {
  apiKey: string;
  secretKey: string;
  uri: string;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  private getFrontendBaseUrl() {
    const frontendOrigins = (process.env.FRONTEND_URL ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    return (
      frontendOrigins.find((origin) => origin.includes(':3001')) ??
      frontendOrigins[0] ??
      'http://localhost:3001'
    );
  }

  private getBackendBaseUrl() {
    return (process.env.BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
  }

  private async getIyzicoConfig(): Promise<IyzicoConfig> {
    const provider = await this.prisma.paymentProviderSetting.findUnique({
      where: { provider: 'iyzico' },
    });

    const enabledFromEnv = process.env.IYZICO_ENABLED === 'true';
    const enabled = Boolean(provider?.enabled) || enabledFromEnv;
    if (!enabled) {
      throw new BadRequestException(
        'Iyzico odeme su anda kapali. Admin panelden saglayiciyi aktif edin.',
      );
    }

    const apiKey = provider?.publicKey ?? process.env.IYZICO_API_KEY ?? '';
    const secretKey = provider?.secretKey ?? process.env.IYZICO_SECRET_KEY ?? '';
    const modeRaw = provider?.mode ?? process.env.IYZICO_MODE ?? 'test';
    const mode = modeRaw.toLowerCase() === 'live' ? 'live' : 'test';
    const uri = mode === 'live' ? 'https://api.iyzipay.com' : 'https://sandbox-api.iyzipay.com';

    if (!apiKey || !secretKey) {
      throw new BadRequestException(
        'Iyzico API bilgileri eksik. IYZICO_API_KEY ve IYZICO_SECRET_KEY tanimlayin.',
      );
    }

    return { apiKey, secretKey, uri };
  }

  private createIyzicoClient(config: IyzicoConfig) {
    return new Iyzipay({
      apiKey: config.apiKey,
      secretKey: config.secretKey,
      uri: config.uri,
    });
  }

  private parseName(fullName: string) {
    const cleaned = fullName.trim().replace(/\s+/g, ' ');
    if (!cleaned) return { name: 'Misafir', surname: 'Kullanici' };
    const [first, ...rest] = cleaned.split(' ');
    return {
      name: first || 'Misafir',
      surname: rest.join(' ') || 'Kullanici',
    };
  }

  private toTryAmount(value: number | string) {
    const amount = Number(value ?? 0);
    return (Number.isFinite(amount) ? amount : 0).toFixed(2);
  }

  private toIyzicoDate(dateInput: Date | string) {
    const date = new Date(dateInput);
    const safe = Number.isNaN(date.getTime()) ? new Date() : date;
    const y = safe.getFullYear();
    const m = `${safe.getMonth() + 1}`.padStart(2, '0');
    const d = `${safe.getDate()}`.padStart(2, '0');
    const hh = `${safe.getHours()}`.padStart(2, '0');
    const mm = `${safe.getMinutes()}`.padStart(2, '0');
    const ss = `${safe.getSeconds()}`.padStart(2, '0');
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
  }

  private checkoutFormInitialize(
    iyzipay: any,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      iyzipay.checkoutFormInitialize.create(
        payload,
        (error: unknown, result: Record<string, unknown> | undefined) => {
        if (error) {
          reject(error);
          return;
        }
        resolve((result ?? {}) as Record<string, unknown>);
        },
      );
    });
  }

  private checkoutFormRetrieve(
    iyzipay: any,
    payload: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return new Promise((resolve, reject) => {
      iyzipay.checkoutForm.retrieve(
        payload,
        (error: unknown, result: Record<string, unknown> | undefined) => {
        if (error) {
          reject(error);
          return;
        }
        resolve((result ?? {}) as Record<string, unknown>);
        },
      );
    });
  }

  private getStayDates(checkIn: Date, checkOut: Date): Date[] {
    const dates: Date[] = [];
    const cursor = new Date(checkIn);
    while (cursor < checkOut) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  async initiate(dto: InitiatePaymentDto) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
      include: {
        user: true,
        bungalow: true,
      },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const existingPayment = await this.prisma.payment.findUnique({
      where: { reservationId: reservation.id },
    });
    const payment = existingPayment
      ? await this.prisma.payment.update({
          where: { id: existingPayment.id },
          data: {
            amount: dto.amount,
            status: 'pending',
            provider: 'iyzico',
          },
        })
      : await this.prisma.payment.create({
          data: {
            reservationId: reservation.id,
            amount: dto.amount,
            status: 'pending',
            provider: 'iyzico',
          },
        });

    const iyzicoConfig = await this.getIyzicoConfig();
    const iyzipay = this.createIyzicoClient(iyzicoConfig);
    const locale = dto.locale?.trim() || 'tr';
    const frontendBaseUrl = this.getFrontendBaseUrl();
    const backendBaseUrl = this.getBackendBaseUrl();
    const callbackUrl = `${backendBaseUrl}/api/payments/iyzico/callback?paymentId=${payment.id}&reservationId=${reservation.id}&locale=${locale}`;
    const parsedName = this.parseName(reservation.user?.name ?? 'Misafir');
    const amount = this.toTryAmount(dto.amount);
    const checkoutInitPayload = {
      locale: locale === 'ar' || locale === 'en' ? locale : 'tr',
      conversationId: payment.id,
      price: amount,
      paidPrice: amount,
      currency: 'TRY',
      basketId: reservation.id,
      paymentGroup: 'PRODUCT',
      callbackUrl,
      enabledInstallments: [1],
      buyer: {
        id: reservation.userId,
        name: parsedName.name,
        surname: parsedName.surname,
        gsmNumber: '+905000000000',
        email: reservation.user?.email ?? 'misafir@example.com',
        identityNumber: '11111111111',
        lastLoginDate: this.toIyzicoDate(new Date()),
        registrationDate: this.toIyzicoDate(reservation.user?.createdAt ?? new Date()),
        registrationAddress: reservation.bungalow.location,
        ip: '85.34.78.112',
        city: reservation.bungalow.location,
        country: 'Turkey',
        zipCode: '34000',
      },
      shippingAddress: {
        contactName: reservation.user?.name ?? 'Misafir Kullanici',
        city: reservation.bungalow.location,
        country: 'Turkey',
        address: reservation.bungalow.location,
        zipCode: '34000',
      },
      billingAddress: {
        contactName: reservation.user?.name ?? 'Misafir Kullanici',
        city: reservation.bungalow.location,
        country: 'Turkey',
        address: reservation.bungalow.location,
        zipCode: '34000',
      },
      basketItems: [
        {
          id: reservation.bungalowId,
          name: reservation.bungalow.title,
          category1: 'Konaklama',
          itemType: 'VIRTUAL',
          price: amount,
        },
      ],
    };

    let initResult: Record<string, unknown>;
    try {
      initResult = await this.checkoutFormInitialize(iyzipay, checkoutInitPayload);
    } catch (error) {
      const detail = error instanceof Error ? error.message : 'Iyzico initialize failed';
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: `failed:${detail.slice(0, 180)}` },
        }),
        this.prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: ReservationStatus.cancelled },
        }),
      ]);
      throw new BadRequestException(`Iyzico odeme baslatilamadi: ${detail}`);
    }

    const initStatus = String(initResult.status ?? '').toLowerCase();
    const paymentPageUrl = String(initResult.paymentPageUrl ?? '');
    if (initStatus !== 'success' || !paymentPageUrl) {
      const detail = String(initResult.errorMessage ?? initResult.errorCode ?? 'Iyzico initialize failed');
      await this.prisma.$transaction([
        this.prisma.payment.update({
          where: { id: payment.id },
          data: { status: `failed:${detail.slice(0, 180)}` },
        }),
        this.prisma.reservation.update({
          where: { id: reservation.id },
          data: { status: ReservationStatus.cancelled },
        }),
      ]);
      throw new BadRequestException(`Iyzico odeme baslatilamadi: ${detail}`);
    }

    return {
      paymentId: payment.id,
      provider: payment.provider,
      redirectUrl: paymentPageUrl,
      callbackUrl,
      resultPageUrl: `${frontendBaseUrl}/${locale}/reservation/result?reservationId=${payment.reservationId}`,
      message: 'Iyzico checkout sayfasi olusturuldu.',
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

    const reservation = await this.prisma.reservation.findUnique({
      where: { id: dto.reservationId },
      select: {
        id: true,
        bungalowId: true,
        checkIn: true,
        checkOut: true,
        status: true,
      },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    const wasPaidBefore = reservation.status === ReservationStatus.paid;

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: dto.paymentStatus },
      });

      await tx.reservation.update({
        where: { id: dto.reservationId },
        data: {
          status: isSuccess ? ReservationStatus.paid : ReservationStatus.cancelled,
        },
      });

      if (isSuccess) {
        const stayDates = this.getStayDates(reservation.checkIn, reservation.checkOut);
        await Promise.all(
          stayDates.map((date) =>
            tx.availability.upsert({
              where: {
                bungalowId_date: {
                  bungalowId: reservation.bungalowId,
                  date,
                },
              },
              update: { isAvailable: false },
              create: {
                bungalowId: reservation.bungalowId,
                date,
                isAvailable: false,
              },
            }),
          ),
        );
      }
    });

    if (isSuccess && !wasPaidBefore) {
      const full = await this.prisma.reservation.findUnique({
        where: { id: dto.reservationId },
        include: { user: true, bungalow: true },
      });
      if (full?.user && full.bungalow) {
        void this.mailService
          .notifyReservationPaid(full, 'tr')
          .catch(() => undefined);
      }
    }

    return { ok: true };
  }

  async handleIyzicoCallback(params: {
    paymentId: string;
    reservationId: string;
    token: string;
    locale?: string;
  }) {
    const payment = await this.prisma.payment.findUnique({
      where: { id: params.paymentId },
      include: {
        reservation: {
          select: {
            id: true,
            bungalowId: true,
            checkIn: true,
            checkOut: true,
          },
        },
      },
    });

    if (!payment || payment.reservationId !== params.reservationId) {
      throw new NotFoundException('Payment not found');
    }

    const prevReservation = await this.prisma.reservation.findUnique({
      where: { id: params.reservationId },
      select: { status: true },
    });
    const wasPaidBefore = prevReservation?.status === ReservationStatus.paid;

    const iyzicoConfig = await this.getIyzicoConfig();
    const iyzipay = this.createIyzicoClient(iyzicoConfig);
    const retrieveResult = await this.checkoutFormRetrieve(iyzipay, {
      locale: params.locale === 'en' || params.locale === 'ar' ? params.locale : 'tr',
      conversationId: payment.id,
      token: params.token,
    });

    const iyzicoStatus = String(retrieveResult.status ?? '').toLowerCase();
    const paymentStatusRaw = String(retrieveResult.paymentStatus ?? '').toLowerCase();
    const isSuccess = iyzicoStatus === 'success' && paymentStatusRaw === 'success';
    const detail = String(retrieveResult.errorMessage ?? retrieveResult.errorCode ?? '').slice(0, 180);

    await this.prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: isSuccess ? 'paid' : detail ? `failed:${detail}` : 'failed' },
      });

      await tx.reservation.update({
        where: { id: payment.reservationId },
        data: { status: isSuccess ? ReservationStatus.paid : ReservationStatus.pending },
      });

      if (isSuccess) {
        const stayDates = this.getStayDates(payment.reservation.checkIn, payment.reservation.checkOut);
        await Promise.all(
          stayDates.map((date) =>
            tx.availability.upsert({
              where: {
                bungalowId_date: {
                  bungalowId: payment.reservation.bungalowId,
                  date,
                },
              },
              update: { isAvailable: false },
              create: {
                bungalowId: payment.reservation.bungalowId,
                date,
                isAvailable: false,
              },
            }),
          ),
        );
      }
    });

    const locale = params.locale?.trim() || 'tr';

    if (isSuccess && !wasPaidBefore) {
      const full = await this.prisma.reservation.findUnique({
        where: { id: payment.reservationId },
        include: { user: true, bungalow: true },
      });
      if (full?.user && full.bungalow) {
        void this.mailService
          .notifyReservationPaid(full, locale)
          .catch(() => undefined);
      }
    }

    const frontendBaseUrl = this.getFrontendBaseUrl();
    const status = isSuccess ? 'paid' : 'failed';
    return `${frontendBaseUrl}/${locale}/reservation/result?status=${status}&reservationId=${payment.reservationId}`;
  }
}
