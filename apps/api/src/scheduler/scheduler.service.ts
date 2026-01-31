import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceTemplatesService } from '../invoice-templates/invoice-templates.service';
import { InvoicesService } from '../invoices/invoices.service';
import { MailerService } from '../mailer/mailer.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly templatesService: InvoiceTemplatesService,
    private readonly invoicesService: InvoicesService,
    private readonly mailerService: MailerService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Get the last day of a given month
   */
  private getLastDayOfMonth(year: number, month: number): Date {
    return new Date(year, month, 0);
  }

  /**
   * Get the last business day of a month
   * If the last day falls on a weekend, returns the previous Friday
   */
  getLastBusinessDayOfMonth(year: number, month: number): Date {
    const lastDay = this.getLastDayOfMonth(year, month);
    const dayOfWeek = lastDay.getDay();

    // If Saturday (6), go back 1 day to Friday
    if (dayOfWeek === 6) {
      lastDay.setDate(lastDay.getDate() - 1);
    }
    // If Sunday (0), go back 2 days to Friday
    else if (dayOfWeek === 0) {
      lastDay.setDate(lastDay.getDate() - 2);
    }

    return lastDay;
  }

  /**
   * Check if today is the last business day of its month
   */
  isLastBusinessDayOfMonth(date: Date = new Date()): boolean {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is 0-indexed

    const lastBusinessDay = this.getLastBusinessDayOfMonth(year, month);

    return (
      date.getFullYear() === lastBusinessDay.getFullYear() &&
      date.getMonth() === lastBusinessDay.getMonth() &&
      date.getDate() === lastBusinessDay.getDate()
    );
  }

  /**
   * Cron job running every day at 06:00
   * Checks if today is the last business day and generates invoices
   */
  @Cron('0 6 * * *', {
    name: 'generate-monthly-invoices',
    timeZone: 'Europe/Warsaw',
  })
  async handleCron() {
    const today = new Date();
    this.logger.log(`🕐 Running invoice generation cron at ${today.toISOString()}`);

    // Check if today is the last business day
    if (!this.isLastBusinessDayOfMonth(today)) {
      this.logger.log('📅 Today is not the last business day of the month. Skipping.');
      return;
    }

    this.logger.log('✅ Today is the last business day! Generating invoices...');

    try {
      // Get all active templates
      const templates = await this.templatesService.findActiveTemplates();
      this.logger.log(`📋 Found ${templates.length} active templates`);

      const month = today.getMonth() + 1;
      const year = today.getFullYear();

      for (const template of templates) {
        try {
          // Check idempotency - skip if invoice already exists
          const existingInvoice = await this.prisma.invoice.findUnique({
            where: {
              template_month_year_unique: {
                templateId: template.id,
                invoiceMonth: month,
                invoiceYear: year,
              },
            },
          });

          if (existingInvoice) {
            this.logger.log(`⏭️ Invoice already exists for template "${template.name}" (${month}/${year}). Skipping.`);
            continue;
          }

          // Create invoice from template
          this.logger.log(`📝 Creating invoice for template "${template.name}"...`);
          
          const invoice = await this.invoicesService.createFromTemplate(template, template.user);
          this.logger.log(`✅ Created invoice ${invoice.invoiceNumber}`);

          // Send email if auto-send is enabled
          if (template.autoSendEmail && template.recipientEmail) {
            this.logger.log(`📧 Sending email to ${template.recipientEmail}...`);
            await this.mailerService.sendInvoiceEmail(invoice, template.recipientEmail);
          }
        } catch (error) {
          this.logger.error(`❌ Failed to process template "${template.name}":`, error);
        }
      }

      this.logger.log('🎉 Invoice generation completed!');
    } catch (error) {
      this.logger.error('❌ Invoice generation cron failed:', error);
    }
  }

  /**
   * Manual trigger for testing (can be called via API if needed)
   */
  async triggerManualGeneration() {
    this.logger.log('🔧 Manual invoice generation triggered');
    await this.handleCron();
  }
}
