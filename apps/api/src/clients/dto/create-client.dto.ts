import { IsString, IsEmail, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateClientDto {
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  address: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @IsString()
  @MinLength(10)
  @MaxLength(10)
  nip: string;

  @IsEmail({}, { message: 'Nieprawidłowy adres e-mail' })
  @IsOptional()
  email?: string;
}
