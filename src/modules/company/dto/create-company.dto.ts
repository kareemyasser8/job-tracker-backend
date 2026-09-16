import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Acme Inc.' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'acme-inc' })
  @IsString()
  normalizedName: string;

  @ApiProperty({ example: 'acme.com', description: 'Optional unique domain' })
  @IsString()
  @IsOptional()
  domain?: string;

  @ApiProperty({ example: 'San Francisco, CA', description: 'Optional location' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'https://cdn.example.com/logos/acme.png', description: 'Optional logo URL' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiProperty({ example: false, description: 'Verification status' })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}