import { Module } from '@nestjs/common';
import { SiteModule } from '../site/site.module';
import { MailService } from './mail.service';

@Module({
  imports: [SiteModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
