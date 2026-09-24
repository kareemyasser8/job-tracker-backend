import { ApiProperty } from '@nestjs/swagger';

export class Company {
  @ApiProperty({ example: '7073b39c-8e1d-4d40-86ac-d331a800c4ee' })
  id: string;

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
