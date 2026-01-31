import { Module, forwardRef } from '@nestjs/common';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { SellerProfilesModule } from '../seller-profiles/seller-profiles.module';
import { MailerModule } from '../mailer/mailer.module';

@Module({
  imports: [SellerProfilesModule, forwardRef(() => MailerModule)],
  controllers: [InvoicesController],
  providers: [InvoicesService, PdfGeneratorService],
  exports: [InvoicesService, PdfGeneratorService],
})
export class InvoicesModule {}
