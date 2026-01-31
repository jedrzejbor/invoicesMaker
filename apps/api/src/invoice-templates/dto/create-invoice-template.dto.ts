import {
  IsString,
  IsBoolean,
  IsNumber,
  IsEmail,
  IsOptional,
  IsArray,
  IsUUID,
  ValidateNested,
  Min,
  Max,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceTemplateItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  name: string;

  @IsString()
  quantity: string;

  @IsString()
  unitPriceNet: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  vatRate?: number;

  @IsNumber()
  @IsOptional()
  sortOrder?: number;
}

export class CreateInvoiceTemplateDto {
  @IsUUID()
  clientId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @Min(1)
  @Max(365)
  @IsOptional()
  paymentDays?: number;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  issuePlace: string;

  @IsBoolean()
  @IsOptional()
  autoSendEmail?: boolean;

  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

  // Seller overrides
  @IsString()
  @IsOptional()
  @MaxLength(255)
  sellerCompanyName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  sellerOwnerName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  sellerAddress?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10)
  sellerNip?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  sellerBankAccount?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  sellerBankName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(11)
  sellerSwift?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceTemplateItemDto)
  items: CreateInvoiceTemplateItemDto[];
}
