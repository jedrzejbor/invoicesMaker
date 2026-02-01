'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { sellerProfileApi } from '@/lib/api';

const sellerProfileSchema = z.object({
  companyName: z.string().min(1, 'Nazwa firmy jest wymagana'),
  ownerName: z.string().min(1, 'Imię i nazwisko jest wymagane'),
  address: z.string().min(1, 'Adres jest wymagany'),
  nip: z.string().regex(/^\d{10}$/, 'NIP musi składać się z 10 cyfr'),
  bankAccount: z.string().min(26, 'Numer konta jest wymagany'),
  bankName: z.string().min(1, 'Nazwa banku jest wymagana'),
  swift: z.string().optional(),
});

type SellerProfileFormData = z.infer<typeof sellerProfileSchema>;

export default function SellerSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SellerProfileFormData>({
    resolver: zodResolver(sellerProfileSchema),
  });

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('fakturke_token');
      if (!token) return;

      try {
        const profile = await sellerProfileApi.get(token);
        if (profile) {
          reset(profile);
        }
      } catch (error) {
        // Profile doesn't exist yet, that's fine
      } finally {
        setIsFetching(false);
      }
    };

    loadProfile();
  }, [reset]);

  const onSubmit = async (data: SellerProfileFormData) => {
    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    setIsLoading(true);
    try {
      await sellerProfileApi.update(token, data);
      toast({
        title: 'Zapisano',
        description: 'Dane sprzedawcy zostały zaktualizowane',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dane sprzedawcy</h1>
        <p className="text-muted-foreground">
          Skonfiguruj domyślne dane Twojej firmy na fakturach
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil sprzedawcy</CardTitle>
          <CardDescription>
            Te dane będą używane jako domyślne na wszystkich fakturach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nazwa firmy</Label>
                <Input
                  id="companyName"
                  placeholder="Moja Firma Sp. z o.o."
                  {...register('companyName')}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">{errors.companyName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerName">Imię i nazwisko właściciela</Label>
                <Input
                  id="ownerName"
                  placeholder="Jan Kowalski"
                  {...register('ownerName')}
                />
                {errors.ownerName && (
                  <p className="text-sm text-red-500">{errors.ownerName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres</Label>
              <Textarea
                id="address"
                placeholder="ul. Przykładowa 123&#10;00-001 Warszawa"
                rows={3}
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nip">NIP</Label>
                <Input
                  id="nip"
                  placeholder="1234567890"
                  maxLength={10}
                  {...register('nip')}
                />
                {errors.nip && (
                  <p className="text-sm text-red-500">{errors.nip.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Nazwa banku</Label>
                <Input
                  id="bankName"
                  placeholder="mBank"
                  {...register('bankName')}
                />
                {errors.bankName && (
                  <p className="text-sm text-red-500">{errors.bankName.message}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankAccount">Numer konta bankowego</Label>
                <Input
                  id="bankAccount"
                  placeholder="PL61 1090 1014 0000 0712 1981 2874"
                  {...register('bankAccount')}
                />
                {errors.bankAccount && (
                  <p className="text-sm text-red-500">{errors.bankAccount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="swift">SWIFT (opcjonalnie)</Label>
                <Input
                  id="swift"
                  placeholder="BREXPLPWMBK"
                  maxLength={11}
                  {...register('swift')}
                />
                {errors.swift && (
                  <p className="text-sm text-red-500">{errors.swift.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
