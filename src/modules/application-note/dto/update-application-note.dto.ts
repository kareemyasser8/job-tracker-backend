import { PartialType } from '@nestjs/swagger';
import { CreateApplicationNoteDto } from './create-application-note.dto.js';

export class UpdateApplicationNoteDto extends PartialType(CreateApplicationNoteDto) {}
