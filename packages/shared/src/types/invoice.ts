export type InvoiceStatus = 'DRAFT' | 'ISSUED' | 'SENT' | 'FAILED';
export type PaymentMethod = 'TRANSFER' | 'CASH' | 'CARD';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  name: string;
  quantity: string;
  unitPriceNet: string;
  vatRate: number;
  valueNet: string;
  valueVat: string;
  valueGross: string;
  sortOrder: number;
}

export interface Invoice {
  id: string;
  userId: string;
  templateId?: string | null;
  
  // Invoice identification
  invoiceNumber: string;
  invoiceMonth: number;
  invoiceYear: number;
  
  // Dates
  issueDate: string; // YYYY-MM-DD
  saleDate: string;
  dueDate: string;
  issuePlace: string;
  
  // Payment
  paymentMethod: PaymentMethod;
  
  // Seller snapshot
  sellerName: string;
  sellerOwner: string;
  sellerAddress: string;
  sellerNip: string;
  sellerBankAccount: string;
  sellerBank: string;
  sellerSwift?: string | null;
  
  // Buyer snapshot
  buyerName: string;
  buyerAddress: string;
  buyerCountry: string;
  buyerNip: string;
  
  // Totals
  totalNet: string;
  totalVat: string;
  totalGross: string;
  amountInWords: string;
  currency: string;
  
  // Status
  status: InvoiceStatus;
  pdfPath?: string | null;
  
  // Relations
  items: InvoiceItem[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  issueDate: string;
  buyerName: string;
  totalGross: string;
  status: InvoiceStatus;
  currency: string;
}

export interface InvoiceFilters {
  month?: number;
  year?: number;
  clientId?: string;
  status?: InvoiceStatus;
}
