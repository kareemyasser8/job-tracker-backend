import { ApiProperty } from '@nestjs/swagger';

export class ApplicationNote {
  @ApiProperty({
    description: 'Unique identifier of the application note',
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the application this note belongs to',
    format: 'uuid',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  applicationId: string;

  @ApiProperty({
    description: 'Note content',
    example: 'Followed up via email, awaiting response.',
  })
  content: string;

  @ApiProperty({ description: 'Creation timestamp', type: String, format: 'date-time' })
  createdAt: Date;
}
