import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Role {
  @ApiProperty({
    description: 'Unique identifier of the role',
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'ID of the user who owns this role',
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    nullable: true,
  })
  ownerId: string | null;

  @ApiProperty({
    description: 'Name of the role',
    example: 'Backend Engineer',
  })
  name: string;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
