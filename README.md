# Fakturke Se Wystaw 🧾

Aplikacja webowa do cyklicznego wystawiania faktur na koniec miesiąca.

## ✨ Funkcjonalności

- 👤 **Autentykacja** - rejestracja i logowanie użytkowników
- 🏢 **Profil sprzedawcy** - konfiguracja danych firmy (NIP, adres, konto bankowe)
- 👥 **Zarządzanie klientami** - lista nabywców z NIP i adresami
- 📄 **Szablony faktur** - cykliczne szablony z pozycjami i stawkami VAT
- ⚡ **Automatyczne generowanie** - faktury wystawiane w ostatni dzień roboczy miesiąca
- 📧 **Wysyłka e-mail** - automatyczne wysyłanie PDF na e-mail klienta
- 📥 **Pobieranie PDF** - możliwość pobrania faktury w formacie PDF
- 🇵🇱 **Polskie formatowanie** - kwoty słownie, format PLN (1 234,56 zł)

## 🏗️ Architektura

```
fakturkeSeWystaw/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/
│   └── shared/       # Współdzielone typy i walidatory
├── docker-compose.yml
└── turbo.json
```

## 🚀 Uruchomienie lokalne

### Wymagania

- Node.js 18+
- pnpm 8+
- Docker i Docker Compose

### Krok 1: Instalacja zależności

```bash
pnpm install
```

### Krok 2: Konfiguracja środowiska

```bash
cp .env.example .env
```

Edytuj plik `.env` według potrzeb.

### Krok 3: Uruchomienie z Docker Compose

```bash
# Uruchom wszystkie serwisy
docker compose up -d

# Lub w trybie deweloperskim (z logami)
docker compose up
```

Serwisy:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **MailHog** (podgląd e-maili): http://localhost:8025
- **PostgreSQL**: localhost:5432

### Krok 4: Inicjalizacja bazy danych

```bash
# Uruchom migracje
pnpm db:migrate

# Załaduj dane testowe
pnpm db:seed
```

## 🔑 Dane testowe

Po uruchomieniu `pnpm db:seed` dostępne jest konto demo:

- **E-mail**: `demo@example.com`
- **Hasło**: `demo123`

## 📋 Komendy

```bash
# Uruchom w trybie deweloperskim
pnpm dev

# Zbuduj wszystkie pakiety
pnpm build

# Uruchom testy
pnpm test

# Uruchom lintery
pnpm lint

# Migracje bazy danych
pnpm db:migrate

# Generowanie klienta Prisma
pnpm db:generate

# Seed bazy danych
pnpm db:seed
```

## 🛠️ Stack technologiczny

### Backend (NestJS)
- **NestJS 10** - framework Node.js
- **Prisma** - ORM dla PostgreSQL
- **JWT** - autentykacja
- **Argon2** - hashowanie haseł
- **Nodemailer** - wysyłka e-maili
- **@nestjs/schedule** - cron jobs

### Frontend (Next.js)
- **Next.js 14** - React framework z App Router
- **TypeScript** - typowanie
- **Tailwind CSS** - stylowanie
- **shadcn/ui** - komponenty UI
- **React Hook Form** - formularze
- **Zod** - walidacja

### Infrastruktura
- **PostgreSQL** - baza danych
- **Docker Compose** - konteneryzacja
- **Turborepo** - monorepo
- **pnpm** - menedżer pakietów

## 📅 Logika generowania faktur

Faktury są generowane automatycznie w **ostatni dzień roboczy miesiąca** o godzinie 06:00 (Europe/Warsaw).

### Zasady:
- Jeśli ostatni dzień miesiąca to **sobota** → faktura w piątek
- Jeśli ostatni dzień miesiąca to **niedziela** → faktura w piątek
- W pozostałych przypadkach → faktura w ostatni dzień miesiąca

### Numeracja:
Format: `{nr_kolejny}/{MM}/{RRRR}`  
Przykład: `1/05/2025`, `2/05/2025`

## 🔧 Zmienne środowiskowe

| Zmienna | Opis | Domyślna wartość |
|---------|------|------------------|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://postgres:postgres@localhost:5432/fakturke?schema=public` |
| `JWT_SECRET` | Sekret do podpisywania JWT | `super-secret-jwt-key` |
| `MAIL_HOST` | Host serwera SMTP | `mailhog` |
| `MAIL_PORT` | Port serwera SMTP | `1025` |
| `MAIL_FROM` | Adres nadawcy e-maili | `noreply@fakturke.local` |
| `NEXT_PUBLIC_API_URL` | URL backendu dla frontendu | `http://localhost:4000` |

## 📝 API Endpoints

### Autentykacja
- `POST /auth/register` - rejestracja
- `POST /auth/login` - logowanie
- `GET /auth/me` - dane zalogowanego użytkownika

### Profil sprzedawcy
- `GET /seller-profile` - pobierz profil
- `PUT /seller-profile` - aktualizuj profil

### Klienci
- `GET /clients` - lista klientów
- `POST /clients` - dodaj klienta
- `GET /clients/:id` - szczegóły klienta
- `PUT /clients/:id` - aktualizuj klienta
- `DELETE /clients/:id` - usuń klienta

### Szablony faktur
- `GET /invoice-templates` - lista szablonów
- `POST /invoice-templates` - utwórz szablon
- `GET /invoice-templates/:id` - szczegóły szablonu
- `PUT /invoice-templates/:id` - aktualizuj szablon
- `DELETE /invoice-templates/:id` - usuń szablon
- `POST /invoice-templates/:id/toggle` - włącz/wyłącz szablon
- `POST /invoice-templates/:id/issue-now` - wystaw fakturę teraz

### Faktury
- `GET /invoices` - lista faktur (filtrowanie: `?month=5&year=2025`)
- `GET /invoices/:id` - szczegóły faktury
- `GET /invoices/:id/pdf` - pobierz PDF
- `POST /invoices/:id/resend-email` - wyślij ponownie e-mail

## 📄 Licencja

MIT

---

Stworzono z ❤️ dla polskich przedsiębiorców 🇵🇱
