import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReservationStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  stats() {
    return this.adminService.stats();
  }

  @Get('bungalows')
  bungalows() {
    return this.adminService.listBungalows();
  }

  @Post('bungalows')
  createBungalow(
    @Body()
    body: {
      title: string;
      description: string;
      pricePerNight: number;
      location: string;
      images: string[];
      features: Record<string, unknown>;
    },
  ) {
    return this.adminService.createBungalow(body);
  }

  @Put('bungalows/:id')
  updateBungalow(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      title: string;
      description: string;
      pricePerNight: number;
      location: string;
      images: string[];
      features: Record<string, unknown>;
    }>,
  ) {
    return this.adminService.updateBungalow(id, body);
  }

  @Delete('bungalows/:id')
  deleteBungalow(@Param('id') id: string) {
    return this.adminService.deleteBungalow(id);
  }

  @Get('reservations')
  reservations(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: ReservationStatus,
    @Query('search') search?: string,
  ) {
    return this.adminService.listReservations({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status,
      search,
    });
  }

  @Patch('reservations/:id')
  patchReservation(@Param('id') id: string, @Body() body: { status: ReservationStatus }) {
    return this.adminService.updateReservationStatus(id, body.status);
  }

  @Get('availability/:bungalowId')
  availability(@Param('bungalowId') bungalowId: string) {
    return this.adminService.listAvailability(bungalowId);
  }

  @Patch('availability/:bungalowId')
  patchAvailability(
    @Param('bungalowId') bungalowId: string,
    @Body() body: { date: string; isAvailable: boolean },
  ) {
    return this.adminService.updateAvailability(bungalowId, body.date, body.isAvailable);
  }

  @Get('translations')
  translations() {
    return this.adminService.listTranslations();
  }

  @Patch('translations')
  upsertTranslation(
    @Body()
    body: {
      key: string;
      tr: string;
      en: string;
      ar: string;
    },
  ) {
    return this.adminService.upsertTranslation(body);
  }
}
