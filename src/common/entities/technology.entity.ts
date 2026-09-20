import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Technology {
  @ApiProperty({
    description: 'Unique identifier of the technology',
    format: 'uuid',
    example: 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'ID of the user who owns this technology',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
    nullable: true,
  })
  ownerId: string | null;

  @ApiProperty({
    description: 'Technology name (must be unique)',
    example: 'TypeScript',
    uniqueItems: true,
    minLength: 1,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    description: 'Whether the technology has been verified',
    example: false,
    default: false,
  })
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
