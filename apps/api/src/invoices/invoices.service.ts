import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SellerProfilesService } from '../seller-profiles/seller-profiles.service';
import { PdfGeneratorService } from './pdf-generator.service';
import { InvoiceStatus } from '@prisma/client';
import Decimal from 'decimal.js';

// Polish number to words conversion
const ONES = ['', 'jeden', 'dwa', 'trzy', 'cztery', 'pięć', 'sześć', 'siedem', 'osiem', 'dziewięć',
  'dziesięć', 'jedenaście', 'dwanaście', 'trzynaście', 'czternaście', 'piętnaście',
  'szesnaście', 'siedemnaście', 'osiemnaście', 'dziewiętnaście'];
const TENS = ['', '', 'dwadzieścia', 'trzydzieści', 'czterdzieści', 'pięćdziesiąt',
  'sześćdziesiąt', 'siedemdziesiąt', 'osiemdziesiąt', 'dziewięćdziesiąt'];
const HUNDREDS = ['', 'sto', 'dwieście', 'trzysta', 'czterysta', 'pięćset',
  'sześćset', 'siedemset', 'osiemset', 'dziewięćset'];
const THOUSANDS = ['', 'tysiąc', 'tysiące', 'tysięcy'];
const MILLIONS = ['', 'milion', 'miliony', 'milionów'];

function getPolishPluralForm(number: number, forms: string[]): string {
  if (number === 1) return forms[1];
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return forms[3];
  if (lastDigit >= 2 && lastDigit <= 4) return forms[2];
  return forms[3];
}

function convertHundreds(n: number): string {
  if (n === 0) return '';
  const parts: string[] = [];
  if (n >= 100) { parts.push(HUNDREDS[Math.floor(n / 100)]); n %= 100; }
  if (n >= 20) { parts.push(TENS[Math.floor(n / 10)]); if (n % 10 > 0) parts.push(ONES[n % 10]); }
  else if (n > 0) { parts.push(ONES[n]); }
  return parts.join(' ');
}

function convertToWords(n: number): string {
  if (n === 0) return 'zero';
  if (n < 0) return 'minus ' + convertToWords(-n);
  const parts: string[] = [];
  if (n >= 1000000) {
    const millions = Math.floor(n / 1000000);
    parts.push(convertHundreds(millions));
    parts.push(getPolishPluralForm(millions, MILLIONS));
    n %= 1000000;
  }
  if (n >= 1000) {
    const thousands = Math.floor(n / 1000);
    if (thousands === 1) parts.push('tysiąc');
    else { parts.push(convertHundreds(thousands)); parts.push(getPolishPluralForm(thousands, THOUSANDS)); }
    n %= 1000;
  }
  if (n > 0) parts.push(convertHundreds(n));
  return parts.filter(Boolean).join(' ');
}

function getZlotyForm(n: number): string {
  if (n === 1) return 'złoty';
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return 'złotych';
  if (lastDigit >= 2 && lastDigit <= 4) return 'złote';
  return 'złotych';
}

function getGroszForm(n: number): string {
  if (n === 1) return 'grosz';
  const lastDigit = n % 10;
  const lastTwoDigits = n % 100;
  if (lastTwoDigits >= 12 && lastTwoDigits <= 14) return 'groszy';
  if (lastDigit >= 2 && lastDigit <= 4) return 'grosze';
  return 'groszy';
}

function numberToWordsPLN(amount: string | number): string {
  const decimal = new Decimal(amount);
  const integerPart = decimal.floor().toNumber();
  const decimalPart = decimal.minus(decimal.floor()).mul(100).round().toNumber();
  const integerWords = convertToWords(integerPart);
  const zlotyForm = getZlotyForm(integerPart);
  const decimalWords = decimalPart === 0 ? 'zero' : convertToWords(decimalPart);
  const groszForm = getGroszForm(decimalPart);
  return `${integerWords} ${zlotyForm} ${decimalWords} ${groszForm}`;
}

@Injectable()
export class InvoicesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sellerProfilesService: SellerProfilesService,
    private readonly pdfGeneratorService: PdfGeneratorService,
  ) {}

  async findAll(userId: string, filters?: { month?: number; year?: number; status?: InvoiceStatus }) {
    const where: any = { userId };
    if (filters?.month) where.invoiceMonth = filters.month;
    if (filters?.year) where.invoiceYear = filters.year;
    if (filters?.status) where.status = filters.status;

    return this.prisma.invoice.findMany({
      where,
      include: { items: { orderBy: { sortOrder: 'asc' } } },
      orderBy: [{ invoiceYear: 'desc' }, { invoiceMonth: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findById(id: string, userId: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: { orderBy: { sortOrder: 'asc' } }, emailLogs: true },
    });
    if (!invoice) throw new NotFoundException('Faktura nie została znaleziona');
    if (invoice.userId !== userId) throw new ForbiddenException('Brak dostępu do tej faktury');
    return invoice;
  }

  async createFromTemplate(template: any, user: any) {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Check idempotency - don't create duplicate invoice for same template/month/year
    const existingInvoice = await this.prisma.invoice.findUnique({
      where: { template_month_year_unique: { templateId: template.id, invoiceMonth: month, invoiceYear: year } },
    });
    if (existingInvoice) {
      throw new ConflictException(`Faktura dla tego szablonu w ${month}/${year} już istnieje`);
    }

    // Get seller profile (use template overrides if set, otherwise default)
    const sellerProfile = await this.sellerProfilesService.getOrThrow(user.id);
    const seller = {
      name: template.sellerCompanyName || sellerProfile.companyName,
      owner: template.sellerOwnerName || sellerProfile.ownerName,
      address: template.sellerAddress || sellerProfile.address,
      nip: template.sellerNip || sellerProfile.nip,
      bankAccount: template.sellerBankAccount || sellerProfile.bankAccount,
      bank: template.sellerBankName || sellerProfile.bankName,
      swift: template.sellerSwift || sellerProfile.swift,
    };

    // Get client data
    const client = template.client;

    // Calculate invoice number
    const invoiceNumber = await this.getNextInvoiceNumber(user.id, month, year);

    // Calculate items
    const items = template.items.map((item: any, index: number) => {
      const quantity = new Decimal(item.quantity);
      const unitPriceNet = new Decimal(item.unitPriceNet);
      const valueNet = quantity.mul(unitPriceNet);
      const valueVat = valueNet.mul(item.vatRate).div(100);
      const valueGross = valueNet.plus(valueVat);
      return {
        name: item.name,
        quantity: item.quantity,
        unitPriceNet: item.unitPriceNet,
        vatRate: item.vatRate,
        valueNet: valueNet.toFixed(2),
        valueVat: valueVat.toFixed(2),
        valueGross: valueGross.toFixed(2),
        sortOrder: index,
      };
    });

    // Calculate totals
    const totalNet = items.reduce((sum: Decimal, item: any) => sum.plus(new Decimal(item.valueNet)), new Decimal(0));
    const totalVat = items.reduce((sum: Decimal, item: any) => sum.plus(new Decimal(item.valueVat)), new Decimal(0));
    const totalGross = items.reduce((sum: Decimal, item: any) => sum.plus(new Decimal(item.valueGross)), new Decimal(0));

    // Calculate dates
    const issueDate = now;
    const saleDate = now;
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + template.paymentDays);

    // Amount in words
    const amountInWords = numberToWordsPLN(totalGross.toFixed(2));

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        userId: user.id,
        templateId: template.id,
        invoiceNumber,
        invoiceMonth: month,
        invoiceYear: year,
        issueDate,
        saleDate,
        dueDate,
        issuePlace: template.issuePlace,
        paymentMethod: 'TRANSFER',
        sellerName: seller.name,
        sellerOwner: seller.owner,
        sellerAddress: seller.address,
        sellerNip: seller.nip,
        sellerBankAccount: seller.bankAccount,
        sellerBank: seller.bank,
        sellerSwift: seller.swift,
        buyerName: client.name,
        buyerAddress: client.address,
        buyerCountry: client.country,
        buyerNip: client.nip,
        totalNet: totalNet.toFixed(2),
        totalVat: totalVat.toFixed(2),
        totalGross: totalGross.toFixed(2),
        amountInWords,
        currency: 'PLN',
        status: 'ISSUED',
        items: { create: items },
      },
      include: { items: { orderBy: { sortOrder: 'asc' } } },
    });

    // Generate PDF
    try {
      const pdfPath = await this.pdfGeneratorService.generateInvoicePdf(invoice);
      await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: { pdfPath },
      });
      invoice.pdfPath = pdfPath;
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    }

    return invoice;
  }

  async getNextInvoiceNumber(userId: string, month: number, year: number): Promise<string> {
    // Find the highest invoice number for this user in this year
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { userId, invoiceYear: year },
      orderBy: { createdAt: 'desc' },
    });

    let nextNumber = 1;
    if (lastInvoice) {
      const parts = lastInvoice.invoiceNumber.split('/');
      const lastNumber = parseInt(parts[0], 10);
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

    const monthStr = String(month).padStart(2, '0');
    return `${nextNumber}/${monthStr}/${year}`;
  }

  async updateStatus(id: string, status: InvoiceStatus) {
    return this.prisma.invoice.update({
      where: { id },
      data: { status },
    });
  }

  async getPdfPath(id: string, userId: string): Promise<string> {
    const invoice = await this.findById(id, userId);
    if (!invoice.pdfPath) {
      // Generate PDF if not exists
      const pdfPath = await this.pdfGeneratorService.generateInvoicePdf(invoice);
      await this.prisma.invoice.update({
        where: { id },
        data: { pdfPath },
      });
      return pdfPath;
    }
    return invoice.pdfPath;
  }
}
