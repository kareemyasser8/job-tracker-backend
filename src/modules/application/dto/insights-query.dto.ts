import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class InsightsQueryDto {
  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Only include applications applied on or after this date',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    type: String,
    format: 'date-time',
    description: 'Only include applications applied on or before this date',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
