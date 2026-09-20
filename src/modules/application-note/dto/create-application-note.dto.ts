import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class CreateApplicationNoteDto {
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    description: 'Application ID this note belongs to',
    format: 'uuid',
  })
  @IsUUID()
  applicationId: string;

  @ApiProperty({
    example: 'Followed up via email, awaiting response.',
    description: 'Note content',
  })
  @IsString()
  content: string;
}
