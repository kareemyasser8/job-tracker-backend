import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsDefined,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto.js';
import { toArray, toBoolean } from '../../../common/utils/to-array.js';
import {
  ApplicationStatus,
  Currency,
  EmploymentType,
  WorkMode,
} from '../../../generated/prisma/enums.js';

export const APPLICATION_SORT_FIELDS = [
  'appliedAt',
  'createdAt',
  'title',
  'salaryMin',
  'salaryMax',
  'position',
] as const;

export type ApplicationSortField = (typeof APPLICATION_SORT_FIELDS)[number];

export class FindApplicationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: ApplicationStatus,
    enumName: 'ApplicationStatus',
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsEnum(ApplicationStatus, { each: true })
  status?: ApplicationStatus[];

  @ApiPropertyOptional({
    enum: WorkMode,
    enumName: 'WorkMode',
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsEnum(WorkMode, { each: true })
  workMode?: WorkMode[];

  @ApiPropertyOptional({
    enum: EmploymentType,
    enumName: 'EmploymentType',
    isArray: true,
  })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsEnum(EmploymentType, { each: true })
  employmentType?: EmploymentType[];

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ isArray: true, type: String, format: 'uuid' })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  @IsUUID('4', { each: true })
  companyId?: string[];

  @ApiPropertyOptional({ isArray: true, type: String, format: 'uuid' })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  @IsUUID('4', { each: true })
  roleId?: string[];

  @ApiPropertyOptional({ isArray: true, type: String, format: 'uuid' })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  @IsUUID('4', { each: true })
  sourceId?: string[];

  @ApiPropertyOptional({ isArray: true, type: String, format: 'uuid' })
  @IsOptional()
  @Transform(({ value }) => toArray(value))
  @IsArray()
  @IsUUID('4', { each: true })
  technologyIds?: string[];

  @ApiPropertyOptional({ enum: ['any', 'all'], default: 'any' })
  @IsOptional()
  @IsIn(['any', 'all'])
  technologyMatch?: 'any' | 'all' = 'any';

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  appliedFrom?: string;

  @ApiPropertyOptional({ type: String, format: 'date-time' })
  @IsOptional()
  @IsDateString()
  appliedTo?: string;

  @ApiPropertyOptional({ type: 'integer', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minSalary?: number;

  @ApiPropertyOptional({ type: 'integer', minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxSalary?: number;

  @ApiPropertyOptional({ enum: Currency, enumName: 'Currency' })
  @ValidateIf((o) => o.minSalary !== undefined || o.maxSalary !== undefined)
  @IsDefined()
  @IsEnum(Currency)
  salaryCurrency?: Currency;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  hasSalary?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  hasJobUrl?: boolean;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  hasNotes?: boolean;

  @ApiPropertyOptional({ enum: APPLICATION_SORT_FIELDS, default: 'createdAt' })
  @IsOptional()
  @IsIn(APPLICATION_SORT_FIELDS)
  sortBy?: ApplicationSortField = 'createdAt';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
