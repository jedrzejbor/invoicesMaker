import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './mailer.service';
import { InvoicesModule } from '../invoices/invoices.module';

@Module({
  imports: [ConfigModule, forwardRef(() => InvoicesModule)],
  providers: [MailerService],
  exports: [MailerService],
})
export class MailerModule {}
