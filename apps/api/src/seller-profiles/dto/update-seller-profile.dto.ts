import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class UpdateSellerProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  companyName?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  ownerName?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MinLength(10)
  @MaxLength(10)
  nip?: string;

  @IsString()
  @IsOptional()
  @MinLength(26)
  @MaxLength(50)
  bankAccount?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(255)
  bankName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(11)
  swift?: string;
}
