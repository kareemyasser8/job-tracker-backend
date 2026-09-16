import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from './user.entity.js';

export class Company {
  @ApiProperty({ example: '7073b39c-8e1d-4d40-86ac-d331a800c4ee' })
  id: string;

  @ApiPropertyOptional({
    example: '46a508df-0a1d-4013-8a40-04223b1f1eb3',
    nullable: true,
  })
  ownerId: string | null;

  @ApiPropertyOptional({ type: () => User })
  owner?: User;

  @ApiProperty({ example: 'Acme Inc.' })
  name: string;

  @ApiProperty({ example: 'acme-inc' })
  normalizedName: string;

  @ApiProperty({ example: 'acme.com' })
  domain: string;

  @ApiProperty({ example: 'San Francisco, CA' })
  location: string;

  @ApiProperty({ example: 'https://cdn.example.com/logos/acme.png' })
  logoUrl: string;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
