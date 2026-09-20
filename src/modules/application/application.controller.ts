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
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Application } from '../../common/entities/application.entity.js';
import { ApplicationService } from './application.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of applications',
    type: PaginatedResponse(Application),
  })
  getApplications(@Query() paginationQuery: PaginationQueryDto) {
    return this.applicationService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an application by id' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'The found application', type: Application })
  @ApiResponse({ status: 404, description: 'Application not found' })
  getApplication(@Param('id') id: string) {
    return this.applicationService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  @ApiResponse({ status: 201, description: 'Application created' })
  createApplication(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationService.createApplication(createApplicationDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application updated' })
  updateApplication(
    @Param('id') id: string,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    return this.applicationService.updateOne(id, updateApplicationDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an application' })
  @ApiParam({ name: 'id', description: 'Application ID' })
  @ApiResponse({ status: 200, description: 'Application deleted' })
  async deleteApplication(@Param('id') id: string): Promise<void> {
    return this.applicationService.deleteOne(id);
  }
}
