import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CreateGuestReservationDto } from './dto/create-guest-reservation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UpdateReservationDto } from './dto/update-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Req() req: { user: { id: string } }, @Body() dto: CreateReservationDto) {
    return this.reservationsService.create(req.user.id, dto);
  }

  @Post('guest')
  createGuest(@Body() dto: CreateGuestReservationDto) {
    return this.reservationsService.createGuest(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.reservationsService.findAll();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.reservationsService.updateStatus(id, dto.status);
  }
}
