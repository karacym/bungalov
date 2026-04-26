import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateEmailSettingsDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsString()
  host?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(65535)
  port?: number;

  @IsOptional()
  @IsBoolean()
  secure?: boolean;

  @IsOptional()
  @IsString()
  authUser?: string;

  /** Bos veya hic gonderilmezse mevcut sifre korunur. */
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @Transform(({ value }) => (value === '' || value === null ? undefined : value))
  @IsOptional()
  @IsEmail()
  fromEmail?: string;

  @IsOptional()
  @IsBoolean()
  notifyAdminOnNewReservation?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyAdminOnContact?: boolean;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @ValidateIf((o) => o.adminNotifyEmail != null && o.adminNotifyEmail !== '')
  @IsEmail()
  adminNotifyEmail?: string | null;
}

export class TestEmailDto {
  @IsEmail()
  to!: string;
}
