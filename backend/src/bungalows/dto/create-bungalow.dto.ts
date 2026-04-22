import { IsArray, IsNotEmpty, IsNumber, IsObject, IsString } from 'class-validator';

export class CreateBungalowDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  pricePerNight: number;

  @IsString()
  location: string;

  @IsArray()
  images: string[];

  @IsObject()
  features: Record<string, unknown>;
}
