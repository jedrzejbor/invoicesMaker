'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { invoicesApi, templatesApi, clientsApi } from '@/lib/api';
import { FileText, Users, Receipt, TrendingUp } from 'lucide-react';

interface Stats {
  clientsCount: number;
  templatesCount: number;
  activeTemplatesCount: number;
  invoicesThisMonth: number;
  invoicesTotal: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({
    clientsCount: 0,
    templatesCount: 0,
    activeTemplatesCount: 0,
    invoicesThisMonth: 0,
    invoicesTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      const token = localStorage.getItem('fakturke_token');
      if (!token) return;

      try {
        const [clients, templates, invoices] = await Promise.all([
          clientsApi.getAll(token),
          templatesApi.getAll(token),
          invoicesApi.getAll(token),
        ]);

        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const currentYear = now.getFullYear();

        const invoicesThisMonth = invoices.filter(
          (inv: any) => inv.invoiceMonth === currentMonth && inv.invoiceYear === currentYear
        ).length;

        setStats({
          clientsCount: clients.length,
          templatesCount: templates.length,
          activeTemplatesCount: templates.filter((t: any) => t.isActive).length,
          invoicesThisMonth,
          invoicesTotal: invoices.length,
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  const statCards = [
    {
      title: 'Klienci',
      value: stats.clientsCount,
      description: 'Zarejestrowanych klientów',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Szablony',
      value: stats.templatesCount,
      description: `${stats.activeTemplatesCount} aktywnych`,
      icon: FileText,
      color: 'text-green-500',
    },
    {
      title: 'Faktury',
      value: stats.invoicesTotal,
      description: 'Wszystkich faktur',
      icon: Receipt,
      color: 'text-purple-500',
    },
    {
      title: 'Ten miesiąc',
      value: stats.invoicesThisMonth,
      description: 'Faktur wystawionych',
      icon: TrendingUp,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Przegląd Twojego systemu fakturowania
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '-' : stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Szybkie akcje</CardTitle>
            <CardDescription>Najczęściej używane funkcje</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/clients"
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="h-5 w-5 mr-3 text-blue-500" />
              <div>
                <div className="font-medium">Dodaj klienta</div>
                <div className="text-sm text-muted-foreground">
                  Zarejestruj nowego nabywcę
                </div>
              </div>
            </a>
            <a
              href="/templates"
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <FileText className="h-5 w-5 mr-3 text-green-500" />
              <div>
                <div className="font-medium">Utwórz szablon</div>
                <div className="text-sm text-muted-foreground">
                  Skonfiguruj cykliczną fakturę
                </div>
              </div>
            </a>
            <a
              href="/invoices"
              className="flex items-center p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Receipt className="h-5 w-5 mr-3 text-purple-500" />
              <div>
                <div className="font-medium">Zobacz faktury</div>
                <div className="text-sm text-muted-foreground">
                  Przeglądaj historię faktur
                </div>
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informacje</CardTitle>
            <CardDescription>Jak działa system</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm">
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>Automatyczne faktury:</strong> System generuje faktury w ostatni dzień roboczy miesiąca
              </li>
              <li>
                <strong>Numeracja:</strong> Faktury są numerowane automatycznie w formacie {'{nr}/{MM}/{RRRR}'}
              </li>
              <li>
                <strong>E-mail:</strong> Faktury mogą być automatycznie wysyłane na e-mail klienta
              </li>
              <li>
                <strong>PDF:</strong> Każda faktura jest dostępna do pobrania jako PDF
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
