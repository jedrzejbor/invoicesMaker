import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const passwordHash = await argon2.hash('demo123');
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      passwordHash,
    },
  });

  console.log('✅ Created user:', user.email);

  // Create seller profile
  const sellerProfile = await prisma.sellerProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      companyName: 'Przykładowa Firma Sp. z o.o.',
      ownerName: 'Jan Kowalski',
      address: 'ul. Przykładowa 123\n00-001 Warszawa',
      nip: '1234567890',
      bankAccount: 'PL61 1090 1014 0000 0712 1981 2874',
      bankName: 'mBank',
      swift: 'BREXPLPWMBK',
    },
  });

  console.log('✅ Created seller profile:', sellerProfile.companyName);

  // Create sample clients
  const client1 = await prisma.client.upsert({
    where: { id: 'client-1' },
    update: {},
    create: {
      id: 'client-1',
      userId: user.id,
      name: 'Acme Corporation Sp. z o.o.',
      address: 'ul. Biznesowa 456\n02-222 Kraków',
      country: 'Polska',
      nip: '9876543210',
      email: 'faktury@acme.pl',
    },
  });

  const client2 = await prisma.client.upsert({
    where: { id: 'client-2' },
    update: {},
    create: {
      id: 'client-2',
      userId: user.id,
      name: 'TechStart S.A.',
      address: 'al. Startupowa 789\n80-300 Gdańsk',
      country: 'Polska',
      nip: '5551234567',
      email: 'accounting@techstart.pl',
    },
  });

  console.log('✅ Created clients:', client1.name, ',', client2.name);

  // Create sample invoice template
  const template = await prisma.invoiceTemplate.upsert({
    where: { id: 'template-1' },
    update: {},
    create: {
      id: 'template-1',
      userId: user.id,
      clientId: client1.id,
      name: 'Miesięczna usługa IT - Acme',
      isActive: true,
      paymentDays: 14,
      issuePlace: 'Warszawa',
      autoSendEmail: true,
      recipientEmail: 'faktury@acme.pl',
      items: {
        create: [
          {
            name: 'Usługi programistyczne - utrzymanie systemu',
            quantity: 1,
            unitPriceNet: 15000.00,
            vatRate: 23,
            sortOrder: 1,
          },
          {
            name: 'Hosting i infrastruktura cloud',
            quantity: 1,
            unitPriceNet: 2500.00,
            vatRate: 23,
            sortOrder: 2,
          },
        ],
      },
    },
  });

  console.log('✅ Created invoice template:', template.name);

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📧 Demo credentials:');
  console.log('   Email: demo@example.com');
  console.log('   Password: demo123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
