import { ApiProperty } from '@nestjs/swagger';
import { ApplicationStatus } from '../../generated/prisma/enums.js';

export class ApplicationInsightsSummary {
  @ApiProperty({
    description: 'Total applications, excluding wishlist and accepted',
    example: 8,
  })
  applications: number;

  @ApiProperty({
    description: 'Applications that received any response',
    example: 5,
  })
  responses: number;

  @ApiProperty({
    description: 'Applications that reached the interview stage',
    example: 3,
  })
  interviews: number;

  @ApiProperty({
    description: 'Applications currently in the offer stage',
    example: 1,
  })
  offers: number;

  @ApiProperty({
    description: 'Percentage of applications that received a response',
    example: 62.5,
  })
  responseRate: number;

  @ApiProperty({
    description: 'Percentage of applications that reached an interview',
    example: 37.5,
  })
  interviewRate: number;
}

export class ApplicationStatusCount {
  @ApiProperty({
    description: 'Application status',
    enum: ApplicationStatus,
    enumName: 'ApplicationStatus',
    example: ApplicationStatus.APPLIED,
  })
  status: ApplicationStatus;

  @ApiProperty({
    description: 'Number of applications with this status',
    example: 2,
  })
  count: number;
}

export class WeeklyApplicationCount {
  @ApiProperty({
    description: 'Sunday that starts the week (UTC, YYYY-MM-DD)',
    type: String,
    format: 'date',
    example: '2026-09-13',
  })
  weekStart: string;

  @ApiProperty({
    description: 'Number of applications applied during this week',
    example: 1,
  })
  count: number;
}
