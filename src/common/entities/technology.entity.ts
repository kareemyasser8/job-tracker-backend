import { ApiProperty } from '@nestjs/swagger';

export class Technology {
  @ApiProperty({
    description: 'Unique identifier of the technology',
    format: 'uuid',
    example: 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b',
  })
  id: string;

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
