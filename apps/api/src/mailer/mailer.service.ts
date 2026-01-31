import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

interface InvoiceForEmail {
  id: string;
  invoiceNumber: string;
  pdfPath?: string | null;
  totalGross: any;
  currency: string;
  buyerName: string;
}

@Injectable()
export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('MAIL_HOST', 'localhost'),
      port: this.configService.get<number>('MAIL_PORT', 1025),
      secure: false,
      // For MailHog, no auth needed
      // For production, add auth: { user, pass }
    });
  }

  async sendInvoiceEmail(invoice: InvoiceForEmail, recipientEmail: string): Promise<void> {
    // Create email log entry
    const emailLog = await this.prisma.emailLog.create({
      data: {
        invoiceId: invoice.id,
        recipientEmail,
        status: 'PENDING',
      },
    });

    try {
      const attachments: nodemailer.Attachment[] = [];

      // Add PDF attachment if exists
      if (invoice.pdfPath) {
        const absolutePath = path.isAbsolute(invoice.pdfPath)
          ? invoice.pdfPath
          : path.join(process.cwd(), invoice.pdfPath);

        if (fs.existsSync(absolutePath)) {
          const filename = `Faktura_${invoice.invoiceNumber.replace(/\//g, '_')}.pdf`;
          attachments.push({
            filename,
            path: absolutePath,
            contentType: invoice.pdfPath.endsWith('.html') ? 'text/html' : 'application/pdf',
          });
        }
      }

      const mailFrom = this.configService.get<string>('MAIL_FROM', 'faktury@example.com');

      await this.transporter.sendMail({
        from: mailFrom,
        to: recipientEmail,
        subject: `Faktura ${invoice.invoiceNumber}`,
        text: `W załączeniu przesyłamy fakturę numer ${invoice.invoiceNumber} na kwotę ${invoice.totalGross} ${invoice.currency}.

Nabywca: ${invoice.buyerName}

W razie pytań prosimy o kontakt.

Pozdrawiamy`,
        html: `
          <p>W załączeniu przesyłamy fakturę numer <strong>${invoice.invoiceNumber}</strong> na kwotę <strong>${invoice.totalGross} ${invoice.currency}</strong>.</p>
          <p>Nabywca: ${invoice.buyerName}</p>
          <p>W razie pytań prosimy o kontakt.</p>
          <p>Pozdrawiamy</p>
        `,
        attachments,
      });

      // Update email log
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      // Update invoice status
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'SENT' },
      });

      console.log(`✉️ Email sent for invoice ${invoice.invoiceNumber} to ${recipientEmail}`);
    } catch (error) {
      console.error(`❌ Failed to send email for invoice ${invoice.invoiceNumber}:`, error);

      // Update email log with error
      await this.prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      // Update invoice status
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'FAILED' },
      });
    }
  }
}
