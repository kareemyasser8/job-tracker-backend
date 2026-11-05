import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto.js';
import {
  ApplicationInsightsSummary,
  ApplicationStatusCount,
  WeeklyApplicationCount,
} from '../../common/entities/application-insights-response.entity.js';
import { ApplicationResponse } from '../../common/entities/application-response.entity.js';
import { ApplicationService } from './application.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { FindApplicationsQueryDto } from './dto/find-applications-query.dto.js';
import { InsightsQueryDto } from './dto/insights-query.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';
import { WeeklyInsightsQueryDto } from './dto/weekly-insights-query.dto.js';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all applications for the current user' })
  @ApiOkResponse({
    description: 'Paginated list of applications',
    type: PaginatedResponse(ApplicationResponse),
  })
  findAll(
    @Query() query: FindApplicationsQueryDto,
    @CurrentUser('userId') userId: string,
  ): Promise<{ total: number; data: ApplicationResponse[] }> {
    return this.applicationService.findAll(query, userId);
  }

  // Alias for backward compatibility with existing tests
  getApplications(
    query: FindApplicationsQueryDto,
    userId: string,
  ): Promise<{ total: number; data: ApplicationResponse[] }> {
    return this.findAll(query, userId);
  }

  @Get('insights/summary')
  @ApiOperation({ summary: 'Get application insights summary' })
  @ApiOkResponse({
    description: 'Aggregated application metrics',
    type: ApplicationInsightsSummary,
  })
  getInsightsSummary(
    @Query() query: InsightsQueryDto,
    @CurrentUser('userId') userId: string,
  ): Promise<ApplicationInsightsSummary> {
    return this.applicationService.getInsightsSummary(query, userId);
  }

  @Get('insights/status')
  @ApiOperation({ summary: 'Get application counts grouped by status' })
  @ApiOkResponse({
    description: 'Application counts by status',
    type: [ApplicationStatusCount],
  })
  getInsightsStatus(
    @Query() query: InsightsQueryDto,
    @CurrentUser('userId') userId: string,
  ): Promise<ApplicationStatusCount[]> {
    return this.applicationService.getInsightsStatus(query, userId);
  }

  @Get('insights/weekly')
  @ApiOperation({ summary: 'Get application counts per week' })
  @ApiOkResponse({
    description: 'Application counts grouped by Sunday-start weeks',
    type: [WeeklyApplicationCount],
  })
  getWeeklyInsights(
    @Query() query: WeeklyInsightsQueryDto,
    @CurrentUser('userId') userId: string,
  ): Promise<WeeklyApplicationCount[]> {
    return this.applicationService.getWeeklyInsights(query, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an application by id' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiOkResponse({
    description: 'The found application',
    type: ApplicationResponse,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  getApplication(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<ApplicationResponse> {
    return this.applicationService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiCreatedResponse({
    description: 'Application created',
    type: ApplicationResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Company/Role/Source/Technology not found or not visible',
  })
  createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @CurrentUser('userId') userId: string,
  ): Promise<ApplicationResponse> {
    return this.applicationService.createApplication(
      createApplicationDto,
      userId,
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiOkResponse({
    description: 'Application updated',
    type: ApplicationResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Application not found or referenced entity not visible',
  })
  updateApplication(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
    @CurrentUser('userId') userId: string,
  ): Promise<ApplicationResponse> {
    return this.applicationService.updateOne(id, updateApplicationDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 204, description: 'Application deleted' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async deleteApplication(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<void> {
    return this.applicationService.deleteOne(id, userId);
  }
}
