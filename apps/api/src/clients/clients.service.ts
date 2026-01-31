import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.client.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string, userId: string) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('Klient nie został znaleziony');
    }

    if (client.userId !== userId) {
      throw new ForbiddenException('Brak dostępu do tego klienta');
    }

    return client;
  }

  async create(userId: string, dto: CreateClientDto) {
    return this.prisma.client.create({
      data: {
        userId,
        name: dto.name,
        address: dto.address,
        country: dto.country || 'Polska',
        nip: dto.nip,
        email: dto.email,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateClientDto) {
    // Verify ownership
    await this.findById(id, userId);

    return this.prisma.client.update({
      where: { id },
      data: {
        name: dto.name,
        address: dto.address,
        country: dto.country,
        nip: dto.nip,
        email: dto.email,
      },
    });
  }

  async delete(id: string, userId: string) {
    // Verify ownership
    await this.findById(id, userId);

    return this.prisma.client.delete({
      where: { id },
    });
  }
}
