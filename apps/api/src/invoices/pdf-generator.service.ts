import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import Decimal from 'decimal.js';

// Simple PDF generation using basic file writing
// In production, consider using PDFKit or @react-pdf/renderer

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  issueDate: Date;
  saleDate: Date;
  dueDate: Date;
  issuePlace: string;
  sellerName: string;
  sellerOwner: string;
  sellerAddress: string;
  sellerNip: string;
  sellerBankAccount: string;
  sellerBank: string;
  sellerSwift?: string | null;
  buyerName: string;
  buyerAddress: string;
  buyerCountry: string;
  buyerNip: string;
  totalNet: any;
  totalVat: any;
  totalGross: any;
  amountInWords: string;
  currency: string;
  items: Array<{
    name: string;
    quantity: any;
    unitPriceNet: any;
    vatRate: number;
    valueNet: any;
    valueVat: any;
    valueGross: any;
    sortOrder: number;
  }>;
}

@Injectable()
export class PdfGeneratorService {
  private storagePath: string;

  constructor(private readonly configService: ConfigService) {
    this.storagePath = this.configService.get<string>('STORAGE_PATH') || './storage';
    
    // Ensure storage directory exists
    if (!fs.existsSync(this.storagePath)) {
      fs.mkdirSync(this.storagePath, { recursive: true });
    }
  }

  formatPLN(amount: string | number | Decimal): string {
    const decimal = new Decimal(amount);
    const fixed = decimal.toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return `${formattedInt},${decPart}`;
  }

  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async generateInvoicePdf(invoice: InvoiceData): Promise<string> {
    // For MVP, we'll generate a simple HTML file and save it
    // In production, use PDFKit or Puppeteer to generate actual PDF

    const html = this.generateInvoiceHtml(invoice);
    
    const filename = `faktura_${invoice.invoiceNumber.replace(/\//g, '_')}_${invoice.id}.html`;
    const filePath = path.join(this.storagePath, filename);
    
    fs.writeFileSync(filePath, html, 'utf-8');
    
    // For actual PDF generation, you would use:
    // - PDFKit: const doc = new PDFDocument(); doc.pipe(fs.createWriteStream(filePath));
    // - Puppeteer: await page.pdf({ path: filePath, format: 'A4' });
    
    return filePath;
  }

  private generateInvoiceHtml(invoice: InvoiceData): string {
    const itemsHtml = invoice.items.map((item, index) => `
      <tr>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${index + 1}</td>
        <td style="border: 1px solid #000; padding: 8px;">${item.name}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${new Decimal(item.quantity).toFixed(2)}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${this.formatPLN(item.unitPriceNet)}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${this.formatPLN(item.valueNet)}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: center;">${item.vatRate}%</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${this.formatPLN(item.valueVat)}</td>
        <td style="border: 1px solid #000; padding: 8px; text-align: right;">${this.formatPLN(item.valueGross)}</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Faktura ${invoice.invoiceNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      margin: 40px;
      color: #000;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 24px;
      margin: 0;
    }
    .dates {
      margin-bottom: 30px;
    }
    .dates p {
      margin: 5px 0;
    }
    .parties {
      display: flex;
      justify-content: space-between;
      margin-bottom: 30px;
    }
    .party {
      width: 45%;
    }
    .party h3 {
      font-size: 14px;
      margin-bottom: 10px;
      border-bottom: 1px solid #000;
      padding-bottom: 5px;
    }
    .party p {
      margin: 3px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      border: 1px solid #000;
      padding: 8px;
      background-color: #f0f0f0;
      font-weight: bold;
      text-align: center;
    }
    .summary {
      margin-top: 20px;
      text-align: right;
    }
    .summary p {
      margin: 5px 0;
    }
    .summary .total {
      font-size: 16px;
      font-weight: bold;
      margin-top: 15px;
    }
    .amount-words {
      margin-top: 20px;
      font-style: italic;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 10px;
      color: #666;
    }
    @media print {
      body { margin: 20px; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Faktura numer ${invoice.invoiceNumber}</h1>
  </div>

  <div class="dates">
    <p><strong>Data wystawienia:</strong> ${invoice.issuePlace}, ${this.formatDate(invoice.issueDate)}</p>
    <p><strong>Data sprzedaży:</strong> ${this.formatDate(invoice.saleDate)}</p>
    <p><strong>Termin płatności:</strong> ${this.formatDate(invoice.dueDate)}</p>
    <p><strong>Płatność:</strong> Przelew</p>
  </div>

  <div class="parties">
    <div class="party">
      <h3>Sprzedawca</h3>
      <p><strong>${invoice.sellerName}</strong></p>
      <p>${invoice.sellerOwner}</p>
      <p>${invoice.sellerAddress.replace(/\n/g, '<br>')}</p>
      <p>NIP: ${invoice.sellerNip}</p>
      <p>Nr konta: ${invoice.sellerBankAccount}</p>
      <p>Bank: ${invoice.sellerBank}</p>
      ${invoice.sellerSwift ? `<p>SWIFT: ${invoice.sellerSwift}</p>` : ''}
    </div>
    <div class="party">
      <h3>Nabywca</h3>
      <p><strong>${invoice.buyerName}</strong></p>
      <p>${invoice.buyerAddress.replace(/\n/g, '<br>')}</p>
      <p>${invoice.buyerCountry}</p>
      <p>NIP: ${invoice.buyerNip}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 5%;">LP</th>
        <th style="width: 30%;">Nazwa towaru/usługi</th>
        <th style="width: 8%;">Ilość</th>
        <th style="width: 12%;">Cena netto</th>
        <th style="width: 12%;">Wartość netto</th>
        <th style="width: 8%;">VAT%</th>
        <th style="width: 12%;">Wartość VAT</th>
        <th style="width: 13%;">Wartość brutto</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <div class="summary">
    <p><strong>Wartość netto:</strong> ${this.formatPLN(invoice.totalNet)} ${invoice.currency}</p>
    <p><strong>Wartość VAT:</strong> ${this.formatPLN(invoice.totalVat)} ${invoice.currency}</p>
    <p class="total"><strong>Do zapłaty:</strong> ${this.formatPLN(invoice.totalGross)} ${invoice.currency}</p>
  </div>

  <div class="amount-words">
    <p><strong>Słownie:</strong> ${invoice.amountInWords}</p>
  </div>

  <div class="footer">
    <p>Strona 1 z 1</p>
  </div>
</body>
</html>
    `.trim();
  }
}
