import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApplicationStatus,
  Currency,
  WorkMode,
} from '../../generated/prisma/enums.js';
import { ApplicationNote } from './application-note.entity.js';
import { Technology } from './technology.entity.js';

export class Application {
  @ApiProperty({
    description: 'Unique identifier of the application',
    format: 'uuid',
    example: 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the user who owns this application',
    format: 'uuid',
    example: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
  })
  userId: string;

  @ApiProperty({ description: 'ID of the company', format: 'uuid' })
  companyId: string;

  @ApiProperty({ description: 'ID of the role', format: 'uuid' })
  roleId: string;

  @ApiProperty({
    description: 'ID of the source where the job was found',
    format: 'uuid',
  })
  sourceId: string;

  @ApiProperty({
    description: 'Current status of the application',
    enum: ApplicationStatus,
    enumName: 'ApplicationStatus',
    default: ApplicationStatus.APPLIED,
    example: ApplicationStatus.APPLIED,
  })
  status: ApplicationStatus;

  @ApiProperty({
    description:
      'Sort order of the application within its status column (lower comes first)',
    type: 'integer',
    default: 1000,
    example: 1000,
  })
  position: number;

  @ApiProperty({
    description: 'Job title as listed in the posting',
    maxLength: 150,
    example: 'Senior Backend Engineer',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Job description or your own summary of it',
    nullable: true,
  })
  description?: string | null;

  @ApiPropertyOptional({
    description: 'Link to the job posting',
    format: 'uri',
    nullable: true,
    example: 'https://example.com/jobs/123',
  })
  jobUrl?: string | null;

  @ApiProperty({
    description: 'Work arrangement',
    enum: WorkMode,
    enumName: 'WorkMode',
    example: WorkMode.REMOTE,
  })
  workMode: WorkMode;

  @ApiPropertyOptional({
    description: 'Employment type',
    maxLength: 50,
    nullable: true,
    example: 'Full-time',
  })
  employmentType?: string | null;

  @ApiPropertyOptional({
    description: 'Minimum salary',
    type: 'integer',
    nullable: true,
    example: 60000,
  })
  salaryMin?: number | null;

  @ApiPropertyOptional({
    description: 'Maximum salary',
    type: 'integer',
    nullable: true,
    example: 90000,
  })
  salaryMax?: number | null;

  @ApiPropertyOptional({
    description: 'Currency of the salary range',
    enum: Currency,
    enumName: 'Currency',
    nullable: true,
    example: Currency.USD,
  })
  salaryCurrency?: Currency | null;

  @ApiProperty({
    description: 'Date the application was submitted',
    type: String,
    format: 'date-time',
  })
  appliedAt: Date;

  @ApiProperty({
    description: 'When the record was created',
    type: String,
    format: 'date-time',
  })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Technologies associated with the application',
    type: () => [Technology],
  })
  technologies?: Technology[];

  @ApiPropertyOptional({
    description: 'Notes attached to the application',
    type: () => [ApplicationNote],
  })
  notes?: ApplicationNote[];
}
