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
import { Technology } from '../../common/entities/technology.entity.js';
import { CreateTechnologyDto } from './dto/create-technology.dto.js';
import { UpdateTechnologyDto } from './dto/update-technology.dto.js';
import { TechnologyService } from './technology.service.js';

@ApiTags('Technologies')
@Controller('technologies')
export class TechnologyController {
  constructor(private readonly technologyService: TechnologyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all technologies' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of technologies',
    type: PaginatedResponse(Technology),
  })
  getTechnologies(@Query() paginationQuery: PaginationQueryDto) {
    return this.technologyService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a technology by id' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({ status: 200, description: 'The found technology', type: Technology })
  @ApiResponse({ status: 404, description: 'Technology not found' })
  getTechnology(@Param('id') id: string) {
    return this.technologyService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new technology' })
  @ApiResponse({ status: 201, description: 'Technology created' })
  createTechnology(@Body() createTechnologyDto: CreateTechnologyDto) {
    return this.technologyService.createTechnology(createTechnologyDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a technology' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({ status: 200, description: 'Technology updated' })
  updateTechnology(@Param('id') id: string, @Body() updateTechnologyDto: UpdateTechnologyDto) {
    return this.technologyService.updateOne(id, updateTechnologyDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a technology' })
  @ApiParam({ name: 'id', description: 'Technology ID' })
  @ApiResponse({ status: 200, description: 'Technology deleted' })
  async deleteTechnology(@Param('id') id: string): Promise<void> {
    return this.technologyService.deleteOne(id);
  }
}
