'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { invoicesApi } from '@/lib/api';
import { Download, Mail, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceMonth: number;
  invoiceYear: number;
  issueDate: string;
  buyerName: string;
  totalGross: string;
  status: 'DRAFT' | 'ISSUED' | 'SENT' | 'FAILED';
  currency: string;
}

const statusMap = {
  DRAFT: { label: 'Szkic', icon: Clock, color: 'text-gray-500' },
  ISSUED: { label: 'Wystawiona', icon: CheckCircle, color: 'text-blue-500' },
  SENT: { label: 'Wysłana', icon: CheckCircle, color: 'text-green-500' },
  FAILED: { label: 'Błąd', icon: XCircle, color: 'text-red-500' },
};

const months = [
  { value: '1', label: 'Styczeń' },
  { value: '2', label: 'Luty' },
  { value: '3', label: 'Marzec' },
  { value: '4', label: 'Kwiecień' },
  { value: '5', label: 'Maj' },
  { value: '6', label: 'Czerwiec' },
  { value: '7', label: 'Lipiec' },
  { value: '8', label: 'Sierpień' },
  { value: '9', label: 'Wrzesień' },
  { value: '10', label: 'Październik' },
  { value: '11', label: 'Listopad' },
  { value: '12', label: 'Grudzień' },
];

export default function InvoicesPage() {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  const [resendingId, setResendingId] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  const loadInvoices = async () => {
    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    setIsLoading(true);
    try {
      const filters: any = {};
      if (selectedMonth && selectedMonth !== 'all') filters.month = parseInt(selectedMonth);
      if (selectedYear) filters.year = parseInt(selectedYear);

      const data = await invoicesApi.getAll(token, filters);
      setInvoices(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się pobrać faktur',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [selectedMonth, selectedYear]);

  const handleDownloadPdf = async (id: string, invoiceNumber: string) => {
    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    try {
      const blob = await invoicesApi.downloadPdf(token, id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Faktura_${invoiceNumber.replace(/\//g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: 'Nie udało się pobrać PDF',
      });
    }
  };

  const handleResendEmail = async (id: string) => {
    const token = localStorage.getItem('fakturke_token');
    if (!token) return;

    setResendingId(id);
    try {
      const result = await invoicesApi.resendEmail(token, id);
      if (result.success) {
        toast({ title: 'Sukces', description: result.message });
        loadInvoices();
      } else {
        toast({ variant: 'destructive', title: 'Błąd', description: result.message });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Błąd',
        description: error instanceof Error ? error.message : 'Nie udało się wysłać e-maila',
      });
    } finally {
      setResendingId(null);
    }
  };

  const formatPLN = (amount: string) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
    }).format(parseFloat(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Faktury</h1>
        <p className="text-muted-foreground">
          Historia wystawionych faktur
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="space-y-2">
              <Label>Miesiąc</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Wszystkie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rok</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Rok" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Brak faktur dla wybranych filtrów.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Numer</TableHead>
                  <TableHead>Data wystawienia</TableHead>
                  <TableHead>Nabywca</TableHead>
                  <TableHead>Kwota brutto</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const status = statusMap[invoice.status];
                  const StatusIcon = status.icon;
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell>{invoice.buyerName}</TableCell>
                      <TableCell>{formatPLN(invoice.totalGross)}</TableCell>
                      <TableCell>
                        <span className={`flex items-center ${status.color}`}>
                          <StatusIcon className="h-4 w-4 mr-1" />
                          {status.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadPdf(invoice.id, invoice.invoiceNumber)}
                          title="Pobierz PDF"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleResendEmail(invoice.id)}
                          disabled={resendingId === invoice.id}
                          title="Wyślij ponownie e-mail"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
