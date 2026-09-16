import { PartialType } from '@nestjs/swagger';
import { CreateSourceDto } from './create-source.dto.js';

export class UpdateSourceDto extends PartialType(CreateSourceDto) {}
