'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { templatesApi, clientsApi } from '@/lib/api';
import { Plus, Pencil, Trash2, Play, Mail, MailOff } from 'lucide-react';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  isActive: boolean;
  paymentDays: number;
  issuePlace: string;
  autoSendEmail: boolean;
  recipientEmail?: string;
  client?: { id: string; name: string };
  items: any[];
}

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [issuingId, setIssuingId] = useState<string | null>(null);

  const loadTemplates = async () => {
    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    try {
      const data = await templatesApi.getAll(token);
      setTemplates(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się pobrać szablonów',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleToggle = async (id: string) => {
    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    try {
      await templatesApi.toggle(token, id);
      loadTemplates();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się zmienić statusu szablonu',
      });
    }
  };

  const handleIssueNow = async (id: string) => {
    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    if (!confirm('Czy na pewno chcesz wystawić fakturę teraz?')) return;

    setIssuingId(id);
    try {
      const invoice = await templatesApi.issueNow(token, id);
      toast({
        title: 'Faktura wystawiona',
        description: `Utworzono fakturę ${invoice.invoiceNumber}`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Nie udało się wystawić faktury',
      });
    } finally {
      setIssuingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Czy na pewno chcesz usunąć ten szablon?')) return;

    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    try {
      await templatesApi.delete(token, id);
      toast({ title: 'Usunięto', description: 'Szablon został usunięty' });
      loadTemplates();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Wystąpił błąd',
      });
    }
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => {
      const net = parseFloat(item.quantity) * parseFloat(item.unitPriceNet);
      const vat = net * (item.vatRate / 100);
      return sum + net + vat;
    }, 0);
  };

  const formatPLN = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Szablony faktur</h1>
          <p className="text-muted-foreground">
            Zarządzaj szablonami cyklicznych faktur
          </p>
        </div>
        <Link href="/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nowy szablon
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Brak szablonów. Utwórz pierwszy szablon, aby automatycznie generować faktury.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Klient</TableHead>
                  <TableHead>Kwota brutto</TableHead>
                  <TableHead>Auto e-mail</TableHead>
                  <TableHead>Aktywny</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell className="font-medium">{template.name}</TableCell>
                    <TableCell>{template.client?.name || '-'}</TableCell>
                    <TableCell>{formatPLN(calculateTotal(template.items))}</TableCell>
                    <TableCell>
                      {template.autoSendEmail ? (
                        <span className="flex items-center text-green-600">
                          <Mail className="h-4 w-4 mr-1" />
                          Tak
                        </span>
                      ) : (
                        <span className="flex items-center text-gray-400">
                          <MailOff className="h-4 w-4 mr-1" />
                          Nie
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={template.isActive}
                        onCheckedChange={() => handleToggle(template.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleIssueNow(template.id)}
                        disabled={issuingId === template.id}
                        title="Wystaw teraz"
                      >
                        <Play className="h-4 w-4 text-green-600" />
                      </Button>
                      <Link href={`/templates/${template.id}`}>
                        <Button variant="ghost" size="icon" title="Edytuj">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(template.id)}
                        title="Usuń"
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
