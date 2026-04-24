import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { ReservationStatus } from '@prisma/client';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AdminService } from './admin.service';
import { ContactService } from '../contact/contact.service';
import { CreateAdminManualReservationDto } from '../reservations/dto/create-admin-manual-reservation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly contactService: ContactService,
  ) {}

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

  @Post('reservations/manual')
  createManualReservation(@Body() body: CreateAdminManualReservationDto) {
    return this.adminService.createManualReservation(body);
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

  @Get('settings')
  getSettings() {
    return this.adminService.getSettings();
  }

  @Patch('settings')
  patchSettings(@Body() body: Record<string, unknown>) {
    return this.adminService.upsertSettings(body);
  }

  @Get('contact')
  contactMessages(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: 'all' | 'unread' | 'read' | 'replied',
  ) {
    return this.contactService.findAllForAdmin({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
      search,
      status: status ?? 'all',
    });
  }

  @Patch('contact/:id/read')
  contactMarkRead(@Param('id') id: string) {
    return this.contactService.markRead(id);
  }

  @Patch('contact/:id/reply')
  contactMarkReplied(@Param('id') id: string) {
    return this.contactService.markReplied(id);
  }

  @Delete('contact/:id')
  contactDelete(@Param('id') id: string) {
    return this.contactService.remove(id);
  }

  @Get('bungalows/:bungalowId/rooms')
  rooms(@Param('bungalowId') bungalowId: string) {
    return this.adminService.listRooms(bungalowId);
  }

  @Post('bungalows/:bungalowId/rooms')
  createRoom(
    @Param('bungalowId') bungalowId: string,
    @Body()
    body: {
      name: string;
      description: string;
      capacity: number;
      pricePerNight: number;
      images: string[];
      features: Record<string, unknown>;
    },
  ) {
    return this.adminService.createRoom(bungalowId, body);
  }

  @Put('rooms/:id')
  updateRoom(
    @Param('id') id: string,
    @Body()
    body: Partial<{
      name: string;
      description: string;
      capacity: number;
      pricePerNight: number;
      images: string[];
      features: Record<string, unknown>;
    }>,
  ) {
    return this.adminService.updateRoom(id, body);
  }

  @Delete('rooms/:id')
  deleteRoom(@Param('id') id: string) {
    return this.adminService.deleteRoom(id);
  }

  @Get('payment-providers')
  paymentProviders() {
    return this.adminService.listPaymentProviders();
  }

  @Patch('payment-providers/:provider')
  patchPaymentProvider(
    @Param('provider') provider: string,
    @Body()
    body: {
      enabled?: boolean;
      mode?: string;
      publicKey?: string | null;
      secretKey?: string | null;
      webhookSecret?: string | null;
      extra?: Record<string, unknown> | null;
    },
  ) {
    return this.adminService.upsertPaymentProvider(provider, body);
  }

  @Get('media')
  media() {
    return this.adminService.listMedia();
  }

  @Post('media/upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          _req: unknown,
          _file: { originalname: string },
          cb: (error: Error | null, destination: string) => void,
        ) => {
          const uploadsDir = join(process.cwd(), 'uploads');
          if (!existsSync(uploadsDir)) {
            mkdirSync(uploadsDir, { recursive: true });
          }
          cb(null, uploadsDir);
        },
        filename: (
          _req: unknown,
          file: { originalname: string },
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `${unique}${extname(file.originalname || '')}`);
        },
      }),
    }),
  )
  async uploadMedia(@UploadedFile() file: { filename: string; mimetype: string; size: number } | undefined) {
    if (!file) {
      throw new HttpException('Dosya alinamadi', HttpStatus.BAD_REQUEST);
    }

    const media = await this.adminService.createMedia({
      url: `/uploads/${file.filename}`,
      filename: file.filename,
      mimeType: file.mimetype ?? 'application/octet-stream',
      size: file.size ?? 0,
    });

    return media;
  }

  @Delete('media/:id')
  deleteMedia(@Param('id') id: string) {
    return this.adminService.deleteMedia(id);
  }
}
