import { Module } from '@nestjs/common';
import { BungalowsController } from './bungalows.controller';
import { BungalowsService } from './bungalows.service';

@Module({
  controllers: [BungalowsController],
  providers: [BungalowsService],
  exports: [BungalowsService],
})
export class BungalowsModule {}
