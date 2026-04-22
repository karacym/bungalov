import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get(':bungalowId')
  list(@Param('bungalowId') bungalowId: string) {
    return this.availabilityService.list(bungalowId);
  }

  @Patch(':bungalowId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('bungalowId') bungalowId: string,
    @Body() body: { date: string; isAvailable: boolean },
  ) {
    return this.availabilityService.update(bungalowId, body.date, body.isAvailable);
  }
}
