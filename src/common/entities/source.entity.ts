import { ApiProperty } from '@nestjs/swagger';

export class Source {
  @ApiProperty({
    description: 'Unique identifier of the source',
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the source',
    example: 'LinkedIn',
  })
  name: string;

  @ApiProperty({ example: true })
  isVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
