import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSellerProfileDto } from './dto/create-seller-profile.dto';
import { UpdateSellerProfileDto } from './dto/update-seller-profile.dto';

@Injectable()
export class SellerProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string) {
    return this.prisma.sellerProfile.findUnique({
      where: { userId },
    });
  }

  async create(userId: string, dto: CreateSellerProfileDto) {
    return this.prisma.sellerProfile.create({
      data: {
        userId,
        companyName: dto.companyName,
        ownerName: dto.ownerName,
        address: dto.address,
        nip: dto.nip,
        bankAccount: dto.bankAccount,
        bankName: dto.bankName,
        swift: dto.swift,
      },
    });
  }

  async update(userId: string, dto: UpdateSellerProfileDto) {
    const profile = await this.findByUserId(userId);
    
    if (!profile) {
      // Create if doesn't exist
      return this.create(userId, dto as CreateSellerProfileDto);
    }

    return this.prisma.sellerProfile.update({
      where: { userId },
      data: {
        companyName: dto.companyName,
        ownerName: dto.ownerName,
        address: dto.address,
        nip: dto.nip,
        bankAccount: dto.bankAccount,
        bankName: dto.bankName,
        swift: dto.swift,
      },
    });
  }

  async getOrThrow(userId: string) {
    const profile = await this.findByUserId(userId);
    if (!profile) {
      throw new NotFoundException('Profil sprzedawcy nie został skonfigurowany');
    }
    return profile;
  }
}
