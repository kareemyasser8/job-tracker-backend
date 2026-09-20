import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { Currency, WorkMode, ApplicationStatusType } from '../../../generated/prisma/enums.js';

export class CreateApplicationDto {
  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
    description: 'Owner user ID',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
    description: 'Company ID',
  })
  @IsUUID()
  companyId: string;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
    description: 'Role ID',
  })
  @IsUUID()
  roleId: string;

  @ApiProperty({
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    format: 'uuid',
    description: 'Source ID',
  })
  @IsUUID()
  sourceId: string;

  @ApiPropertyOptional({
    enum: ApplicationStatusType,
    enumName: 'ApplicationStatus',
    default: ApplicationStatusType.APPLIED,
    example: ApplicationStatusType.APPLIED,
    description: 'Application status',
  })
  @IsOptional()
  @IsEnum(ApplicationStatusType)
  status?: ApplicationStatusType;

  @ApiPropertyOptional({
    type: 'integer',
    default: 1000,
    example: 1000,
    description: 'Position within status column',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  position?: number;

  @ApiProperty({ example: 'Senior Backend Engineer', maxLength: 150 })
  @IsString()
  @MaxLength(150)
  title: string;

  @ApiPropertyOptional({ description: 'Job description', nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Job posting URL',
    nullable: true,
    example: 'https://example.com/jobs/123',
  })
  @IsOptional()
  @IsString()
  jobUrl?: string;

  @ApiProperty({
    enum: WorkMode,
    enumName: 'WorkMode',
    example: WorkMode.REMOTE,
    description: 'Work arrangement',
  })
  @IsEnum(WorkMode)
  workMode: WorkMode;

  @ApiPropertyOptional({ maxLength: 50, nullable: true, example: 'Full-time' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  employmentType?: string;

  @ApiPropertyOptional({ type: 'integer', nullable: true, example: 60000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMin?: number;

  @ApiPropertyOptional({ type: 'integer', nullable: true, example: 90000 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  salaryMax?: number;

  @ApiPropertyOptional({
    enum: Currency,
    enumName: 'Currency',
    nullable: true,
    example: Currency.USD,
  })
  @IsOptional()
  @IsEnum(Currency)
  salaryCurrency?: Currency;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-09-14T10:55:11.715Z' })
  @IsDateString()
  appliedAt: string;

  @ApiPropertyOptional({
    description: 'Technology IDs to link to this application',
    type: [String],
    format: 'uuid',
    isArray: true,
    example: ['b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  technologyIds?: string[];
}
