import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';
import Decimal from 'decimal.js';

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
    const filename = `faktura_${invoice.invoiceNumber.replace(/\//g, '_')}_${invoice.id}.pdf`;
    const filePath = path.join(this.storagePath, filename);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const stream = fs.createWriteStream(filePath);

      doc.on('error', reject);
      stream.on('error', reject);
      doc.pipe(stream);

      const fontsBase = path.dirname(require.resolve('dejavu-fonts-ttf/package.json'));
      const fontsDir = path.join(fontsBase, 'ttf');
      doc.registerFont('R', path.join(fontsDir, 'DejaVuSans.ttf'));
      doc.registerFont('B', path.join(fontsDir, 'DejaVuSans-Bold.ttf'));

      const L = 50;                        // left margin
      const pageW = doc.page.width;
      const R = pageW - 50;               // right edge
      const W = R - L;                    // content width
      const MID = L + W / 2;

      // Helper: draw horizontal rule
      const rule = (y: number, color = '#cccccc') => {
        doc.moveTo(L, y).lineTo(R, y).lineWidth(0.5).strokeColor(color).stroke();
        doc.lineWidth(1).strokeColor('#000000');
      };

      // ── HEADER ──────────────────────────────────────────────────────
      doc.font('R').fontSize(9).text('Faktura numer ', L, 50, { continued: true });
      doc.font('B').fontSize(9).text(invoice.invoiceNumber);
      doc.moveDown(1.2);

      // ── DATES ────────────────────────────────────────────────────────
      const dateY = doc.y;
      const labelW = 110;
      const lineH = 14;

      const dateRow = (label: string, value: string, y: number) => {
        doc.font('B').fontSize(9).text(label, L, y, { width: labelW });
        doc.font('R').fontSize(9).text(value, L + labelW, y);
      };
      dateRow('Data wystawienia:', `${invoice.issuePlace}, ${this.formatDate(invoice.issueDate)}`, dateY);
      dateRow('Data sprzedaży:', this.formatDate(invoice.saleDate), dateY + lineH);
      dateRow('Termin płatności:', this.formatDate(invoice.dueDate), dateY + lineH * 2);
      dateRow('Płatność:', 'Przelew', dateY + lineH * 3);

      doc.y = dateY + lineH * 4 + 8;
      rule(doc.y);
      doc.y += 12;

      // ── PARTIES ──────────────────────────────────────────────────────
      const partyY = doc.y;
      const partyColW = W / 2 - 10;
      const buyerX = MID + 10;

      // Seller
      doc.font('B').fontSize(9).text('Sprzedawca', L, partyY);
      let sellerY = partyY + 14;
      const sellerLines = [
        invoice.sellerName,
        invoice.sellerOwner,
        ...invoice.sellerAddress.split('\n'),
        `NIP ${invoice.sellerNip}`,
        `Konto: ${invoice.sellerBankAccount}`,
        `Bank: ${invoice.sellerBank}`,
        ...(invoice.sellerSwift ? [`SWIFT: ${invoice.sellerSwift}`] : []),
      ];
      sellerLines.forEach(line => {
        doc.font('R').fontSize(8.5).text(line, L, sellerY, { width: partyColW });
        sellerY += 12;
      });

      // Buyer
      doc.font('B').fontSize(9).text('Nabywca', buyerX, partyY);
      let buyerY = partyY + 14;
      const buyerLines = [
        invoice.buyerName,
        ...invoice.buyerAddress.split('\n'),
        ...(invoice.buyerCountry ? [invoice.buyerCountry] : []),
        `NIP ${invoice.buyerNip}`,
      ];
      buyerLines.forEach(line => {
        doc.font('R').fontSize(8.5).text(line, buyerX, buyerY, { width: partyColW });
        buyerY += 12;
      });

      doc.y = Math.max(sellerY, buyerY) + 8;

      // ── TABLE ────────────────────────────────────────────────────────
      // Column widths sum exactly to W (495) → table spans full content width L→R
      const cols: [string, number, 'left' | 'center' | 'right'][] = [
        ['LP',                   22, 'center'],
        ['Nazwa towaru / usługi',145, 'left'],
        ['Ilość',                34, 'center'],
        ['Cena netto',           64, 'right'],
        ['Wartość netto',        74, 'right'],
        ['VAT %',                30, 'center'],
        ['Wartość VAT',          64, 'right'],
        ['Wartość brutto',       62, 'right'],
      ];
      const totalW = cols.reduce((s, c) => s + c[1], 0); // = 495
      const tX = L;   // table starts at left margin, spans full content width

      const headerH = 28;  // tall enough for 2-line headers
      const cellPad = 4;
      const vPad = 2; // vertical padding top + bottom

      // Compute column X positions
      const colX: number[] = [];
      let cx = tX;
      cols.forEach(([, w]) => { colX.push(cx); cx += w; });

      // Measure the actual height a row needs based on its content
      const measureRowHeight = (
        cells: string[],
        font: 'R' | 'B',
        fontSize: number,
      ): number => {
        let maxH = fontSize * 1.15; // minimum: one line
        cells.forEach((cell, i) => {
          if (!cell) return;
          doc.font(font).fontSize(fontSize);
          const h = doc.heightOfString(cell, {
            width: cols[i][1] - cellPad * 2,
            lineBreak: true,
          });
          if (h > maxH) maxH = h;
        });
        return Math.ceil(maxH) + vPad * 2;
      };

      // Data row drawer – dynamic height, vertically centred
      const drawTableRow = (
        cells: string[],
        y: number,
        font: 'R' | 'B',
        fontSize: number,
        bg?: string,
      ): number => {
        const height = measureRowHeight(cells, font, fontSize);
        if (bg) {
          doc.rect(tX, y, totalW, height).fill(bg);
        }
        cells.forEach((cell, i) => {
          if (!cell) return;
          doc.font(font).fontSize(fontSize);
          const cellH = doc.heightOfString(cell, {
            width: cols[i][1] - cellPad * 2,
            lineBreak: true,
          });
          const textY = y + Math.round((height - cellH) / 2);
          doc.fillColor('#000000')
            .text(cell, colX[i] + cellPad, textY, {
              width: cols[i][1] - cellPad * 2,
              align: cols[i][2],
              lineBreak: true,
            });
        });
        return height;
      };

      // Header row drawer – allows text wrap, top-aligned with small top padding
      const drawHeaderRow = (y: number) => {
        doc.rect(tX, y, totalW, headerH).fill('#f0f0f0');
        cols.forEach((col, i) => {
          doc.font('B').fontSize(7.5).fillColor('#000000')
            .text(col[0], colX[i] + cellPad, y + 5, {
              width: cols[i][1] - cellPad * 2,
              align: col[2],
              lineBreak: true,
              height: headerH - 5,
            });
        });
      };

      // Table header
      const tableTopY = doc.y;
      let tableY = tableTopY;
      // top border
      doc.moveTo(tX, tableY).lineTo(tX + totalW, tableY).lineWidth(0.5).strokeColor('#000000').stroke();
      drawHeaderRow(tableY);
      tableY += headerH;
      // bottom-of-header border
      doc.moveTo(tX, tableY).lineTo(tX + totalW, tableY).lineWidth(0.5).strokeColor('#000000').stroke();

      // Data rows
      invoice.items.forEach((item, idx) => {
        const rh = drawTableRow([
          String(idx + 1),
          item.name,
          new Decimal(item.quantity).toFixed(0),
          this.formatPLN(item.unitPriceNet),
          this.formatPLN(item.valueNet),
          String(item.vatRate),
          this.formatPLN(item.valueVat),
          this.formatPLN(item.valueGross),
        ], tableY, 'R', 8);
        tableY += rh;
        doc.moveTo(tX, tableY).lineTo(tX + totalW, tableY).lineWidth(0.3).strokeColor('#bbbbbb').stroke();
      });

      // "W tym" row
      const wTymH = drawTableRow([
        '', 'W tym', '',
        this.formatPLN(invoice.totalNet),
        this.formatPLN(invoice.totalNet),
        invoice.items.length === 1 ? String(invoice.items[0].vatRate) : '',
        this.formatPLN(invoice.totalVat),
        this.formatPLN(invoice.totalGross),
      ], tableY, 'R', 8);
      tableY += wTymH;
      doc.moveTo(tX, tableY).lineTo(tX + totalW, tableY).lineWidth(0.3).strokeColor('#bbbbbb').stroke();

      // "Razem" row
      const razemH = drawTableRow([
        '', 'Razem', '',
        this.formatPLN(invoice.totalNet),
        '', '',
        this.formatPLN(invoice.totalVat),
        this.formatPLN(invoice.totalGross),
      ], tableY, 'B', 8);
      tableY += razemH;
      // bottom border of table
      doc.moveTo(tX, tableY).lineTo(tX + totalW, tableY).lineWidth(0.5).strokeColor('#000000').stroke();

      // Left and right vertical borders spanning entire table height
      doc.moveTo(tX, tableTopY).lineTo(tX, tableY).lineWidth(0.5).strokeColor('#000000').stroke();
      doc.moveTo(tX + totalW, tableTopY).lineTo(tX + totalW, tableY).lineWidth(0.5).strokeColor('#000000').stroke();
      doc.lineWidth(1).strokeColor('#000000');

      // ── SUMMARY BOX (right-aligned) ────────────────────────────────
      tableY += 14;
      const summaryLabelX = R - 210;
      const summaryValueX = R - 100;
      const summaryValueW = 100;
      const sumLineH = 14;

      const summaryRow = (label: string, value: string, y: number, bold = false) => {
        doc.font('B').fontSize(9).text(label, summaryLabelX, y, { width: 105 });
        doc.font(bold ? 'B' : 'R').fontSize(9)
          .text(value, summaryValueX, y, { width: summaryValueW, align: 'right' });
      };

      summaryRow('Wartość netto', `${this.formatPLN(invoice.totalNet)} ${invoice.currency}`, tableY);
      summaryRow('Wartość VAT', `${this.formatPLN(invoice.totalVat)} ${invoice.currency}`, tableY + sumLineH);
      summaryRow('Wartość brutto', `${this.formatPLN(invoice.totalGross)} ${invoice.currency}`, tableY + sumLineH * 2, true);

      // ── DO ZAPŁATY ────────────────────────────────────────────────
      tableY += sumLineH * 3 + 18;
      rule(tableY, '#000');
      tableY += 10;

      const payLabelW = 90;
      doc.font('B').fontSize(10).text('Do zapłaty', L, tableY, { width: payLabelW });
      doc.font('B').fontSize(10).text(
        `${this.formatPLN(invoice.totalGross)} ${invoice.currency}`,
        L + payLabelW + 10, tableY,
      );
      doc.font('R').fontSize(8).text(
        `Słownie: ${invoice.amountInWords}`,
        L + payLabelW + 10, tableY + 14,
        { width: W - payLabelW - 10 },
      );

      tableY += 36;
      rule(tableY, '#000');

      doc.end();
      stream.on('finish', () => resolve(filePath));
    });
  }
}
