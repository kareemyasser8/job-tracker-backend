import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, IsUUID } from 'class-validator';

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

  @ApiPropertyOptional({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'Owner user ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string;

  @ApiProperty({ example: false, description: 'Verification status' })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean;
}