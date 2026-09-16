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
import { Source } from '../../common/entities/source.entity.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';
import { SourceService } from './source.service.js';

@ApiTags('Sources')
@Controller('sources')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all sources' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of sources',
    type: PaginatedResponse(Source),
  })
  getSources(@Query() paginationQuery: PaginationQueryDto) {
    return this.sourceService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a source by id' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'The found source', type: Source })
  @ApiResponse({ status: 404, description: 'Source not found' })
  getSource(@Param('id') id: string) {
    return this.sourceService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new source' })
  @ApiResponse({ status: 201, description: 'Source created' })
  createSource(@Body() createSourceDto: CreateSourceDto) {
    return this.sourceService.createSource(createSourceDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a source' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'Source updated' })
  updateSource(@Param('id') id: string, @Body() updateSourceDto: UpdateSourceDto) {
    return this.sourceService.updateOne(id, updateSourceDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a source' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'Source deleted' })
  async deleteSource(@Param('id') id: string): Promise<void> {
    return this.sourceService.deleteOne(id);
  }
}
