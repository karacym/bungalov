import { Body, Controller, Post } from '@nestjs/common';
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
}
