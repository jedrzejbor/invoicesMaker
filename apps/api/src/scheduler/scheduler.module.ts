import { Module } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
import { InvoiceTemplatesModule } from '../invoice-templates/invoice-templates.module';
import { InvoicesModule } from '../invoices/invoices.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [InvoiceTemplatesModule, InvoicesModule, MailerModule],
  providers: [SchedulerService],
})
export class SchedulerModule {}
