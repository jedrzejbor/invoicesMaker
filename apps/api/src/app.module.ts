import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SellerProfilesModule } from './seller-profiles/seller-profiles.module';
import { ClientsModule } from './clients/clients.module';
import { InvoiceTemplatesModule } from './invoice-templates/invoice-templates.module';
import { InvoicesModule } from './invoices/invoices.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    SellerProfilesModule,
    ClientsModule,
    InvoiceTemplatesModule,
    InvoicesModule,
    SchedulerModule,
    MailerModule,
  ],
})
export class AppModule {}
