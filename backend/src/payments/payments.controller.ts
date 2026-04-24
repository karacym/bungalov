import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentCallbackDto } from './dto/payment-callback.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  initiate(@Body() dto: InitiatePaymentDto) {
    return this.paymentsService.initiate(dto);
  }

  @Post('callback')
  callback(@Body() dto: PaymentCallbackDto) {
    return this.paymentsService.callback(dto);
  }

  @Get('iyzico/callback')
  async iyzicoCallback(
    @Query('paymentId') paymentId: string,
    @Query('reservationId') reservationId: string,
    @Query('token') token: string,
    @Query('locale') locale: string,
    @Res() res: Response,
  ) {
    const redirectUrl = await this.handleIyzicoCallback({
      paymentId,
      reservationId,
      token,
      locale,
    });
    return res.redirect(302, redirectUrl);
  }

  @Post('iyzico/callback')
  async iyzicoCallbackPost(
    @Query('paymentId') paymentId: string,
    @Query('reservationId') reservationId: string,
    @Query('locale') locale: string,
    @Body() body: { token?: string; paymentId?: string; reservationId?: string; locale?: string },
    @Res() res: Response,
  ) {
    const redirectUrl = await this.handleIyzicoCallback({
      paymentId: paymentId || body.paymentId || '',
      reservationId: reservationId || body.reservationId || '',
      token: body.token ?? '',
      locale: locale || body.locale || 'tr',
    });
    return res.redirect(302, redirectUrl);
  }

  private async handleIyzicoCallback(params: {
    paymentId: string;
    reservationId: string;
    token: string;
    locale?: string;
  }) {
    const redirectUrl = await this.paymentsService.handleIyzicoCallback({
      paymentId: params.paymentId,
      reservationId: params.reservationId,
      token: params.token,
      locale: params.locale,
    });
    return redirectUrl;
  }
}
