import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ApplicationStatus,
  Currency,
  EmploymentType,
  WorkMode,
} from '../../generated/prisma/enums.js';

export class ApplicationResponse {
  @ApiProperty({
    description: 'Unique identifier of the application',
    format: 'uuid',
    example: 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b',
  })
  id: string;

  @ApiProperty({
    description: 'Current status of the application',
    enum: ApplicationStatus,
    enumName: 'ApplicationStatus',
    example: ApplicationStatus.APPLIED,
  })
  status: ApplicationStatus;

  @ApiProperty({
    description: 'Sort order of the application within its status column',
    type: 'integer',
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
    example: 'Great opportunity',
  })
  description: string | null;

  @ApiPropertyOptional({
    description: 'Link to the job posting',
    format: 'uri',
    nullable: true,
    example: 'https://example.com/jobs/123',
  })
  jobUrl: string | null;

  @ApiProperty({
    description: 'Work arrangement',
    enum: WorkMode,
    enumName: 'WorkMode',
    example: WorkMode.REMOTE,
  })
  workMode: WorkMode;

  @ApiPropertyOptional({
    description: 'Employment type',
    enum: EmploymentType,
    enumName: 'EmploymentType',
    nullable: true,
    example: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType | null;

  @ApiPropertyOptional({
    description: 'Minimum salary',
    type: 'integer',
    nullable: true,
    example: 60000,
  })
  salaryMin: number | null;

  @ApiPropertyOptional({
    description: 'Maximum salary',
    type: 'integer',
    nullable: true,
    example: 90000,
  })
  salaryMax: number | null;

  @ApiPropertyOptional({
    description: 'Currency of the salary range',
    enum: Currency,
    enumName: 'Currency',
    nullable: true,
    example: Currency.USD,
  })
  salaryCurrency: Currency | null;

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

  @ApiProperty({
    description: 'Company name',
    example: 'Acme Inc.',
  })
  company: string;

  @ApiProperty({
    description: 'Role name',
    example: 'Backend Engineer',
  })
  role: string;

  @ApiProperty({
    description: 'Source name',
    example: 'LinkedIn',
  })
  source: string;

  @ApiProperty({
    description: 'Technology names associated with the application',
    type: [String],
    example: ['NestJS', 'PostgreSQL'],
  })
  technologies: string[];

  @ApiProperty({
    description: 'Note contents attached to the application',
    type: [String],
    example: ['note content 1', 'note content 2'],
  })
  notes: string[];
}
