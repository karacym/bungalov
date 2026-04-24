import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Put,
  UseGuards,
} from '@nestjs/common';
import { BungalowsService } from './bungalows.service';
import { CreateBungalowDto } from './dto/create-bungalow.dto';
import { UpdateBungalowDto } from './dto/update-bungalow.dto';
import { SearchBungalowsDto } from './dto/search-bungalows.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@Controller('bungalows')
export class BungalowsController {
  constructor(private readonly bungalowsService: BungalowsService) {}

  @Get()
  findAll() {
    return this.bungalowsService.findAll();
  }

  @Get('search')
  search(@Query() query: SearchBungalowsDto) {
    return this.bungalowsService.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bungalowsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateBungalowDto) {
    return this.bungalowsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() dto: UpdateBungalowDto) {
    return this.bungalowsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.bungalowsService.remove(id);
  }
}
