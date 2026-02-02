import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceTemplateDto } from './dto/create-invoice-template.dto';
import { UpdateInvoiceTemplateDto } from './dto/update-invoice-template.dto';

@Injectable()
export class InvoiceTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.invoiceTemplate.findMany({
      where: { userId },
      include: {
        client: {
          select: { 
            id: true, 
            name: true, 
            address: true, 
            country: true, 
            nip: true 
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, userId: string) {
    const template = await this.prisma.invoiceTemplate.findUnique({
      where: { id },
      include: {
        client: {
          select: { 
            id: true, 
            name: true, 
            address: true, 
            country: true, 
            nip: true 
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    if (!template) {
      throw new NotFoundException('Szablon nie został znaleziony');
    }

    if (template.userId !== userId) {
      throw new ForbiddenException('Brak dostępu do tego szablonu');
    }

    return template;
  }

  async findActiveTemplates() {
    return this.prisma.invoiceTemplate.findMany({
      where: { isActive: true },
      include: {
        client: true,
        items: {
          orderBy: { sortOrder: 'asc' },
        },
        user: {
          include: {
            sellerProfile: true,
          },
        },
      },
    });
  }

  async create(userId: string, dto: CreateInvoiceTemplateDto) {
    return this.prisma.invoiceTemplate.create({
      data: {
        userId,
        clientId: dto.clientId,
        name: dto.name,
        isActive: dto.isActive ?? true,
        paymentDays: dto.paymentDays ?? 14,
        issuePlace: dto.issuePlace,
        autoSendEmail: dto.autoSendEmail ?? false,
        recipientEmail: dto.recipientEmail,
        sellerCompanyName: dto.sellerCompanyName,
        sellerOwnerName: dto.sellerOwnerName,
        sellerAddress: dto.sellerAddress,
        sellerNip: dto.sellerNip,
        sellerBankAccount: dto.sellerBankAccount,
        sellerBankName: dto.sellerBankName,
        sellerSwift: dto.sellerSwift,
        items: {
          create: dto.items.map((item, index) => ({
            name: item.name,
            quantity: item.quantity,
            unitPriceNet: item.unitPriceNet,
            vatRate: item.vatRate ?? 23,
            sortOrder: item.sortOrder ?? index,
          })),
        },
      },
      include: {
        client: {
          select: { 
            id: true, 
            name: true, 
            address: true, 
            country: true, 
            nip: true 
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateInvoiceTemplateDto) {
    // Verify ownership
    await this.findById(id, userId);

    // Delete existing items if new items provided
    if (dto.items) {
      await this.prisma.invoiceTemplateItem.deleteMany({
        where: { templateId: id },
      });
    }

    return this.prisma.invoiceTemplate.update({
      where: { id },
      data: {
        clientId: dto.clientId,
        name: dto.name,
        isActive: dto.isActive,
        paymentDays: dto.paymentDays,
        issuePlace: dto.issuePlace,
        autoSendEmail: dto.autoSendEmail,
        recipientEmail: dto.recipientEmail,
        sellerCompanyName: dto.sellerCompanyName,
        sellerOwnerName: dto.sellerOwnerName,
        sellerAddress: dto.sellerAddress,
        sellerNip: dto.sellerNip,
        sellerBankAccount: dto.sellerBankAccount,
        sellerBankName: dto.sellerBankName,
        sellerSwift: dto.sellerSwift,
        items: dto.items
          ? {
              create: dto.items.map((item, index) => ({
                name: item.name,
                quantity: item.quantity,
                unitPriceNet: item.unitPriceNet,
                vatRate: item.vatRate ?? 23,
                sortOrder: item.sortOrder ?? index,
              })),
            }
          : undefined,
      },
      include: {
        client: {
          select: { 
            id: true, 
            name: true, 
            address: true, 
            country: true, 
            nip: true 
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async toggle(id: string, userId: string) {
    const template = await this.findById(id, userId);

    return this.prisma.invoiceTemplate.update({
      where: { id },
      data: {
        isActive: !template.isActive,
      },
      include: {
        client: {
          select: { 
            id: true, 
            name: true, 
            address: true, 
            country: true, 
            nip: true 
          },
        },
        items: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    // Verify ownership
    await this.findById(id, userId);

    return this.prisma.invoiceTemplate.delete({
      where: { id },
    });
  }
}
