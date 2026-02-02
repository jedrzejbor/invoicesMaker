'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { templatesApi, clientsApi } from '@/lib/api';
import { Plus, Trash2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const itemSchema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  quantity: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, 'Ilość musi być większa od 0'),
  unitPriceNet: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, 'Cena musi być nieujemna'),
  vatRate: z.number().min(0).max(100).default(23),
});

const templateSchema = z.object({
  clientId: z.string().uuid('Wybierz prawidłowego klienta'),
  name: z.string().min(1, 'Nazwa szablonu jest wymagana'),
  isActive: z.boolean().default(true),
  paymentDays: z.number().min(1).max(365).default(14),
  issuePlace: z.string().min(1, 'Miejsce wystawienia jest wymagane'),
  autoSendEmail: z.boolean().default(false),
  recipientEmail: z.string().email('Nieprawidłowy e-mail').optional().or(z.literal('')),
  items: z.array(itemSchema).min(1, 'Dodaj co najmniej jedną pozycję'),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface Client {
  id: string;
  name: string;
  email?: string;
}

export default function NewTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TemplateFormData>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      isActive: true,
      paymentDays: 14,
      autoSendEmail: false,
      items: [{ name: '', quantity: '1', unitPriceNet: '0', vatRate: 23 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchAutoSendEmail = watch('autoSendEmail');
  const watchClientId = watch('clientId');
  const watchItems = watch('items');

  useEffect(() => {
    const loadClients = async () => {
      const token = localStorage.getItem('fakturke_token');
      if (!token) return;

      try {
        const data = await clientsApi.getAll(token);
        setClients(data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Błąd',
          description: 'Nie udało się pobrać listy klientów',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadClients();
  }, []);

  // Auto-fill recipient email when client changes
  useEffect(() => {
    if (watchClientId) {
      const client = clients.find((c) => c.id === watchClientId);
      if (client?.email) {
        setValue('recipientEmail', client.email);
      }
    }
  }, [watchClientId, clients, setValue]);

  const calculateTotal = () => {
    return watchItems.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unitPriceNet) || 0;
      const net = qty * price;
      const vat = net * ((item.vatRate || 23) / 100);
      return sum + net + vat;
    }, 0);
  };

  const formatPLN = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(amount);
  };

  const onSubmit = async (data: TemplateFormData) => {
    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    setIsSubmitting(true);
    try {
      await templatesApi.create(token, data);
      toast({
        title: 'Sukces',
        description: 'Szablon został utworzony',
      });
      router.push('/templates');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/templates">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Nowy szablon</h1>
          <p className="text-muted-foreground">
            Utwórz szablon cyklicznej faktury
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Podstawowe informacje</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nazwa szablonu</Label>
                <Input id="name" placeholder="np. Miesięczna usługa IT" {...register('name')} />
                {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientId">Klient</Label>
                <Select onValueChange={(value) => setValue('clientId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz klienta" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && <p className="text-sm text-red-500">{errors.clientId.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="issuePlace">Miejsce wystawienia</Label>
                <Input id="issuePlace" placeholder="np. Warszawa" {...register('issuePlace')} />
                {errors.issuePlace && <p className="text-sm text-red-500">{errors.issuePlace.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDays">Termin płatności (dni)</Label>
                <Input
                  id="paymentDays"
                  type="number"
                  min={1}
                  max={365}
                  {...register('paymentDays', { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={watch('isActive')}
                  onCheckedChange={(checked) => setValue('isActive', checked)}
                />
                <Label htmlFor="isActive">Szablon aktywny</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automatyczna wysyłka e-mail</CardTitle>
            <CardDescription>
              Skonfiguruj automatyczne wysyłanie faktury na e-mail
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoSendEmail"
                checked={watchAutoSendEmail}
                onCheckedChange={(checked) => setValue('autoSendEmail', checked)}
              />
              <Label htmlFor="autoSendEmail">Automatycznie wyślij PDF na e-mail</Label>
            </div>

            {watchAutoSendEmail && (
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">E-mail odbiorcy</Label>
                <Input
                  id="recipientEmail"
                  type="email"
                  placeholder="faktury@firma.pl"
                  {...register('recipientEmail')}
                />
                {errors.recipientEmail && (
                  <p className="text-sm text-red-500">{errors.recipientEmail.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Pozycje faktury</CardTitle>
              <CardDescription>Dodaj pozycje, które będą na fakturze</CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ name: '', quantity: '1', unitPriceNet: '0', vatRate: 23 })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Dodaj pozycję
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-4 items-end p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>Nazwa usługi/towaru</Label>
                  <Input {...register(`items.${index}.name`)} placeholder="np. Usługi programistyczne" />
                  {errors.items?.[index]?.name && (
                    <p className="text-sm text-red-500">{errors.items[index]?.name?.message}</p>
                  )}
                </div>
                <div className="w-24 space-y-2">
                  <Label>Ilość</Label>
                  <Input {...register(`items.${index}.quantity`)} type="number" step="0.01" min="0" />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Cena netto</Label>
                  <Input {...register(`items.${index}.unitPriceNet`)} type="number" step="0.01" min="0" />
                </div>
                <div className="w-24 space-y-2">
                  <Label>VAT %</Label>
                  <Input {...register(`items.${index}.vatRate`, { valueAsNumber: true })} type="number" min="0" max="100" />
                </div>
                {fields.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
            {errors.items && <p className="text-sm text-red-500">{errors.items.message}</p>}

            <div className="text-right text-lg font-semibold">
              Razem brutto: {formatPLN(calculateTotal())}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Zapisywanie...' : 'Utwórz szablon'}
          </Button>
          <Link href="/templates">
            <Button type="button" variant="outline">
              Anuluj
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
