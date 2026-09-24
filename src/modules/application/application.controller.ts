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
import { ApplicationResponse } from '../../common/entities/application-response.entity.js';
import { ApplicationService } from './application.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { FindApplicationsQueryDto } from './dto/find-applications-query.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';

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
  @ApiResponse({ status: 404, description: 'Company/Role/Source/Technology not found or not visible' })
  createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
    @CurrentUser('userId') userId: string,
  ): Promise<ApplicationResponse> {
    return this.applicationService.createApplication(createApplicationDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiOkResponse({
    description: 'Application updated',
    type: ApplicationResponse,
  })
  @ApiResponse({ status: 404, description: 'Application not found or referenced entity not visible' })
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
