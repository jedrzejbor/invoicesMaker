import { z } from 'zod';

const nipRegex = /^\d{10}$/;
const bankAccountRegex = /^[A-Z]{2}\d{2}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}[\s]?\d{4}$|^\d{26}$/;

export const sellerProfileSchema = z.object({
  companyName: z.string().min(1, 'Nazwa firmy jest wymagana').max(255),
  ownerName: z.string().min(1, 'Imię i nazwisko właściciela jest wymagane').max(255),
  address: z.string().min(1, 'Adres jest wymagany').max(500),
  nip: z.string().regex(nipRegex, 'NIP musi składać się z 10 cyfr'),
  bankAccount: z.string().min(26, 'Numer konta jest wymagany').max(50),
  bankName: z.string().min(1, 'Nazwa banku jest wymagana').max(255),
  swift: z.string().max(11).optional().or(z.literal('')),
});

export const updateSellerProfileSchema = sellerProfileSchema.partial();

export type SellerProfileFormData = z.infer<typeof sellerProfileSchema>;
export type UpdateSellerProfileFormData = z.infer<typeof updateSellerProfileSchema>;
