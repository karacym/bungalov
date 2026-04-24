import { Transform } from 'class-transformer';
import { IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateContactDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsEmail()
  @MaxLength(320)
  email: string;

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10000)
  message: string;
}
