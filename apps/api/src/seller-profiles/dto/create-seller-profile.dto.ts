import { IsString, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateSellerProfileDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  companyName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  ownerName: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  address: string;

  @IsString()
  @MinLength(10)
  @MaxLength(10)
  nip: string;

  @IsString()
  @MinLength(26)
  @MaxLength(50)
  bankAccount: string;

  @IsString()
  @MinLength(1)
  @MaxLength(255)
  bankName: string;

  @IsString()
  @IsOptional()
  @MaxLength(11)
  swift?: string;
}
