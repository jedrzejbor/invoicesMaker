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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { clientsApi } from '@/lib/api';
import { Plus, Pencil, Trash2, X } from 'lucide-react';

const clientSchema = z.object({
  name: z.string().min(1, 'Nazwa firmy jest wymagana'),
  address: z.string().min(1, 'Adres jest wymagany'),
  country: z.string().default('Polska'),
  nip: z.string().regex(/^\d{10}$/, 'NIP musi składać się z 10 cyfr'),
  email: z.string().email('Nieprawidłowy e-mail').optional().or(z.literal('')),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface Client {
  id: string;
  name: string;
  address: string;
  country: string;
  nip: string;
  email?: string;
}

export default function ClientsPage() {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      country: 'Polska',
    },
  });

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

  useEffect(() => {
    loadClients();
  }, []);

  const openForm = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      reset(client);
    } else {
      setEditingClient(null);
      reset({ country: 'Polska' });
    }
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingClient(null);
    reset({ country: 'Polska' });
  };

  const onSubmit = async (data: ClientFormData) => {
    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    setIsSubmitting(true);
    try {
      if (editingClient) {
        await clientsApi.update(token, editingClient.id, data);
        toast({ title: 'Zapisano', description: 'Dane klienta zostały zaktualizowane' });
      } else {
        await clientsApi.create(token, data);
        toast({ title: 'Dodano', description: 'Klient został dodany' });
      }
      closeForm();
      loadClients();
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

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć tego klienta?')) return;

    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    try {
      await clientsApi.delete(token, id);
      toast({ title: 'Usunięto', description: 'Klient został usunięty' });
      loadClients();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Klienci</h1>
          <p className="text-muted-foreground">
            Zarządzaj listą nabywców
          </p>
        </div>
        <Button onClick={() => openForm()}>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj klienta
        </Button>
      </div>

      {isFormOpen && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{editingClient ? 'Edytuj klienta' : 'Nowy klient'}</CardTitle>
              <CardDescription>
                {editingClient ? 'Zaktualizuj dane klienta' : 'Dodaj nowego nabywcę'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={closeForm}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nazwa firmy</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nip">NIP</Label>
                  <Input id="nip" maxLength={10} {...register('nip')} />
                  {errors.nip && <p className="text-sm text-red-500">{errors.nip.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adres</Label>
                <Textarea id="address" rows={2} {...register('address')} />
                {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="country">Kraj</Label>
                  <Input id="country" {...register('country')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail (opcjonalnie)</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>
                  Anuluj
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Brak klientów. Dodaj pierwszego klienta, aby rozpocząć.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa firmy</TableHead>
                  <TableHead>NIP</TableHead>
                  <TableHead>Adres</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.nip}</TableCell>
                    <TableCell className="max-w-xs truncate">{client.address}</TableCell>
                    <TableCell>{client.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openForm(client)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(client.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
