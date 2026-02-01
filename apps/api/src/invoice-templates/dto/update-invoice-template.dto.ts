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
import { CreateInvoiceTemplateItemDto } from './create-invoice-template.dto';

export class UpdateInvoiceTemplateDto {
  @IsUUID()
  @IsOptional()
  clientId?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  name?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsNumber()
  @Min(1)
  @Max(365)
  @IsOptional()
  paymentDays?: number;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  issuePlace?: string;

  @IsBoolean()
  @IsOptional()
  autoSendEmail?: boolean;

  @IsEmail()
  @IsOptional()
  recipientEmail?: string;

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
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceTemplateItemDto)
  items?: CreateInvoiceTemplateItemDto[];
}
