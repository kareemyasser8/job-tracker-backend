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
import { Source } from '../../common/entities/source.entity.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';
import { SourceService } from './source.service.js';

@ApiTags('Sources')
@Controller('sources')
export class SourceController {
  constructor(private readonly sourceService: SourceService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all sources visible to the current user (seeded + own)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of sources',
    type: PaginatedResponse(Source),
  })
  getSources(
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sourceService.findAll(paginationQuery, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a source by id' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'The found source', type: Source })
  @ApiResponse({ status: 404, description: 'Source not found' })
  getSource(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.sourceService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new source owned by the current user' })
  @ApiResponse({ status: 201, description: 'Source created', type: Source })
  createSource(
    @Body() createSourceDto: CreateSourceDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sourceService.createSource(createSourceDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a source you own' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 200, description: 'Source updated', type: Source })
  @ApiResponse({ status: 403, description: 'Source is read-only (seeded)' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  updateSource(
    @Param('id') id: string,
    @Body() updateSourceDto: UpdateSourceDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.sourceService.updateOne(id, updateSourceDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a source you own' })
  @ApiParam({ name: 'id', description: 'Source ID' })
  @ApiResponse({ status: 204, description: 'Source deleted' })
  @ApiResponse({ status: 403, description: 'Source is read-only (seeded)' })
  @ApiResponse({ status: 404, description: 'Source not found' })
  async deleteSource(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<void> {
    return this.sourceService.deleteOne(id, userId);
  }
}
