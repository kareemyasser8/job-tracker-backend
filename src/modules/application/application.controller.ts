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
  @ApiOperation({ summary: 'Get all applications' })
  @ApiOkResponse({
    description: 'Paginated list of applications',
    type: PaginatedResponse(ApplicationResponse),
  })
  findAll(
    @Query() query: FindApplicationsQueryDto,
  ): Promise<{ total: number; data: ApplicationResponse[] }> {
    return this.applicationService.findAll(query);
  }

  // Alias for backward compatibility with existing tests
  getApplications(
    query: FindApplicationsQueryDto,
  ): Promise<{ total: number; data: ApplicationResponse[] }> {
    return this.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an application by id' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiOkResponse({
    description: 'The found application',
    type: ApplicationResponse,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  getApplication(@Param('id') id: string): Promise<ApplicationResponse> {
    return this.applicationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiCreatedResponse({
    description: 'Application created',
    type: ApplicationResponse,
  })
  createApplication(
    @Body() createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationResponse> {
    return this.applicationService.createApplication(createApplicationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiOkResponse({
    description: 'Application updated',
    type: ApplicationResponse,
  })
  @ApiResponse({ status: 404, description: 'Application not found' })
  updateApplication(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ): Promise<ApplicationResponse> {
    return this.applicationService.updateOne(id, updateApplicationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 204, description: 'Application deleted' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  async deleteApplication(@Param('id') id: string): Promise<void> {
    return this.applicationService.deleteOne(id);
  }
}
