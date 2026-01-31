import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Res,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InvoicesService } from './invoices.service';
import { MailerService } from '../mailer/mailer.service';
import { InvoiceStatus } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly mailerService: MailerService,
  ) {}

  @Get()
  async findAll(
    @Request() req: any,
    @Query('month') month?: string,
    @Query('year') year?: string,
    @Query('status') status?: InvoiceStatus,
  ) {
    const filters: any = {};
    if (month) filters.month = parseInt(month, 10);
    if (year) filters.year = parseInt(year, 10);
    if (status) filters.status = status;
    
    return this.invoicesService.findAll(req.user.id, filters);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.invoicesService.findById(id, req.user.id);
  }

  @Get(':id/pdf')
  async downloadPdf(
    @Param('id') id: string,
    @Request() req: any,
    @Res() res: Response,
  ) {
    const pdfPath = await this.invoicesService.getPdfPath(id, req.user.id);
    const invoice = await this.invoicesService.findById(id, req.user.id);
    
    const absolutePath = path.isAbsolute(pdfPath)
      ? pdfPath
      : path.join(process.cwd(), pdfPath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Plik PDF nie został znaleziony' });
    }

    const filename = `Faktura_${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    const fileStream = fs.createReadStream(absolutePath);
    fileStream.pipe(res);
  }

  @Post(':id/resend')
  async resendEmail(@Param('id') id: string, @Request() req: any) {
    const invoice = await this.invoicesService.findById(id, req.user.id);
    
    // Get template to find recipient email
    if (!invoice.templateId) {
      return { success: false, message: 'Brak szablonu powiązanego z fakturą' };
    }

    const template = await this.invoicesService['prisma'].invoiceTemplate.findUnique({
      where: { id: invoice.templateId },
    });

    if (!template?.recipientEmail) {
      return { success: false, message: 'Brak adresu e-mail odbiorcy w szablonie' };
    }

    await this.mailerService.sendInvoiceEmail(invoice, template.recipientEmail);
    
    return { success: true, message: 'E-mail został wysłany ponownie' };
  }
}
