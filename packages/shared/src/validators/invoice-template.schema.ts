import { z } from 'zod';

export const invoiceTemplateItemSchema = z.object({
  name: z.string().min(1, 'Nazwa pozycji jest wymagana').max(500),
  quantity: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Ilość musi być liczbą większą od 0',
  }),
  unitPriceNet: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: 'Cena netto musi być liczbą nieujemną',
  }),
  vatRate: z.number().min(0).max(100).default(23),
  sortOrder: z.number().optional(),
});

export const invoiceTemplateSchema = z.object({
  clientId: z.string().uuid('Wybierz klienta'),
  name: z.string().min(1, 'Nazwa szablonu jest wymagana').max(255),
  isActive: z.boolean().default(true),
  paymentDays: z.number().min(1).max(365).default(14),
  issuePlace: z.string().min(1, 'Miejsce wystawienia jest wymagane').max(255),
  autoSendEmail: z.boolean().default(false),
  recipientEmail: z.string().email('Nieprawidłowy adres e-mail').optional().or(z.literal('')),
  
  // Seller overrides (optional)
  sellerCompanyName: z.string().max(255).optional().or(z.literal('')),
  sellerOwnerName: z.string().max(255).optional().or(z.literal('')),
  sellerAddress: z.string().max(500).optional().or(z.literal('')),
  sellerNip: z.string().optional().or(z.literal('')),
  sellerBankAccount: z.string().max(50).optional().or(z.literal('')),
  sellerBankName: z.string().max(255).optional().or(z.literal('')),
  sellerSwift: z.string().max(11).optional().or(z.literal('')),
  
  items: z.array(invoiceTemplateItemSchema).min(1, 'Dodaj co najmniej jedną pozycję'),
});

export const updateInvoiceTemplateSchema = invoiceTemplateSchema.partial();

export type InvoiceTemplateItemFormData = z.infer<typeof invoiceTemplateItemSchema>;
export type InvoiceTemplateFormData = z.infer<typeof invoiceTemplateSchema>;
export type UpdateInvoiceTemplateFormData = z.infer<typeof updateInvoiceTemplateSchema>;
