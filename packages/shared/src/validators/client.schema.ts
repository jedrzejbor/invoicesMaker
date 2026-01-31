import { z } from 'zod';

const nipRegex = /^\d{10}$/;

export const clientSchema = z.object({
  name: z.string().min(1, 'Nazwa firmy jest wymagana').max(255),
  address: z.string().min(1, 'Adres jest wymagany').max(500),
  country: z.string().min(1, 'Kraj jest wymagany').max(100).default('Polska'),
  nip: z.string().regex(nipRegex, 'NIP musi składać się z 10 cyfr'),
  email: z.string().email('Nieprawidłowy adres e-mail').optional().or(z.literal('')),
});

export const updateClientSchema = clientSchema.partial();

export type ClientFormData = z.infer<typeof clientSchema>;
export type UpdateClientFormData = z.infer<typeof updateClientSchema>;
