import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { InsightsQueryDto } from './insights-query.dto.js';

export class WeeklyInsightsQueryDto extends InsightsQueryDto {
  @ApiPropertyOptional({
    default: 8,
    minimum: 1,
    maximum: 52,
    description: 'Number of weeks to include when no from/to range is provided',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(52)
  weeks?: number = 8;
}
