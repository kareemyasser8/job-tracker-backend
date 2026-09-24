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
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Technology } from '../../common/entities/technology.entity.js';
import { CreateTechnologyDto } from './dto/create-technology.dto.js';
import { UpdateTechnologyDto } from './dto/update-technology.dto.js';
import { TechnologyService } from './technology.service.js';

@ApiTags('Technologies')
@Controller('technologies')
export class TechnologyController {
  constructor(private readonly technologyService: TechnologyService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all technologies visible to the current user (seeded + own)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of technologies',
    type: PaginatedResponse(Technology),
  })
  getTechnologies(
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.technologyService.findAll(paginationQuery, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a technology by id' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({ status: 200, description: 'The found technology', type: Technology })
  @ApiResponse({ status: 404, description: 'Technology not found' })
  getTechnology(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.technologyService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new technology owned by the current user' })
  @ApiResponse({ status: 201, description: 'Technology created', type: Technology })
  createTechnology(
    @Body() createTechnologyDto: CreateTechnologyDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.technologyService.createTechnology(createTechnologyDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a technology you own' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({ status: 200, description: 'Technology updated', type: Technology })
  @ApiResponse({ status: 403, description: 'Technology is read-only (seeded)' })
  @ApiResponse({ status: 404, description: 'Technology not found' })
  updateTechnology(
    @Param('id') id: string,
    @Body() updateTechnologyDto: UpdateTechnologyDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.technologyService.updateOne(id, updateTechnologyDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a technology you own' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({ status: 204, description: 'Technology deleted' })
  @ApiResponse({ status: 403, description: 'Technology is read-only (seeded)' })
  @ApiResponse({ status: 404, description: 'Technology not found' })
  async deleteTechnology(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<void> {
    return this.technologyService.deleteOne(id, userId);
  }
}
