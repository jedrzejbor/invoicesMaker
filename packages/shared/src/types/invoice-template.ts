export interface InvoiceTemplateItem {
  id: string;
  templateId: string;
  name: string;
  quantity: string; // Decimal as string
  unitPriceNet: string; // Decimal as string
  vatRate: number;
  sortOrder: number;
}

export interface InvoiceTemplate {
  id: string;
  userId: string;
  clientId: string;
  name: string;
  isActive: boolean;
  paymentDays: number;
  issuePlace: string;
  autoSendEmail: boolean;
  recipientEmail?: string | null;
  
  // Seller override fields (optional)
  sellerCompanyName?: string | null;
  sellerOwnerName?: string | null;
  sellerAddress?: string | null;
  sellerNip?: string | null;
  sellerBankAccount?: string | null;
  sellerBankName?: string | null;
  sellerSwift?: string | null;
  
  items: InvoiceTemplateItem[];
  client?: {
    id: string;
    name: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInvoiceTemplateItemDto {
  name: string;
  quantity: string;
  unitPriceNet: string;
  vatRate: number;
  sortOrder?: number;
}

export interface CreateInvoiceTemplateDto {
  clientId: string;
  name: string;
  isActive?: boolean;
  paymentDays?: number;
  issuePlace: string;
  autoSendEmail?: boolean;
  recipientEmail?: string;
  
  // Seller overrides
  sellerCompanyName?: string;
  sellerOwnerName?: string;
  sellerAddress?: string;
  sellerNip?: string;
  sellerBankAccount?: string;
  sellerBankName?: string;
  sellerSwift?: string;
  
  items: CreateInvoiceTemplateItemDto[];
}

export interface UpdateInvoiceTemplateDto {
  clientId?: string;
  name?: string;
  isActive?: boolean;
  paymentDays?: number;
  issuePlace?: string;
  autoSendEmail?: boolean;
  recipientEmail?: string;
  
  // Seller overrides
  sellerCompanyName?: string;
  sellerOwnerName?: string;
  sellerAddress?: string;
  sellerNip?: string;
  sellerBankAccount?: string;
  sellerBankName?: string;
  sellerSwift?: string;
  
  items?: CreateInvoiceTemplateItemDto[];
}
