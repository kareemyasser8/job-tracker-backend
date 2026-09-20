import { PartialType } from '@nestjs/swagger';
import { CreateTechnologyDto } from './create-technology.dto.js';

export class UpdateTechnologyDto extends PartialType(CreateTechnologyDto) {}
