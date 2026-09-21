import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateApplicationDto } from './create-application.dto.js';

export class UpdateApplicationDto extends OmitType(
  PartialType(CreateApplicationDto),
  ['userId'] as const,
) {}
