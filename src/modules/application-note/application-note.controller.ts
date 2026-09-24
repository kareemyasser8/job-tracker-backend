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
import { ApplicationNote } from '../../common/entities/application-note.entity.js';
import { ApplicationNoteService } from './application-note.service.js';
import { CreateApplicationNoteDto } from './dto/create-application-note.dto.js';
import { UpdateApplicationNoteDto } from './dto/update-application-note.dto.js';

@ApiTags('ApplicationNotes')
@Controller('application-notes')
export class ApplicationNoteController {
  constructor(private readonly applicationNoteService: ApplicationNoteService) {}

  @Get()
  @ApiOperation({ summary: 'Get all application notes for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of application notes',
    type: PaginatedResponse(ApplicationNote),
  })
  getApplicationNotes(
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.applicationNoteService.findAll(paginationQuery, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an application note by id' })
  @ApiParam({ name: 'id', description: 'ApplicationNote ID' })
  @ApiResponse({ status: 200, description: 'The found application note', type: ApplicationNote })
  @ApiResponse({ status: 404, description: 'ApplicationNote not found' })
  getApplicationNote(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.applicationNoteService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new application note' })
  @ApiResponse({ status: 201, description: 'ApplicationNote created' })
  @ApiResponse({ status: 404, description: 'Application not found' })
  createApplicationNote(
    @Body() createApplicationNoteDto: CreateApplicationNoteDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.applicationNoteService.createApplicationNote(createApplicationNoteDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an application note' })
  @ApiParam({ name: 'id', description: 'ApplicationNote ID' })
  @ApiResponse({ status: 200, description: 'ApplicationNote updated' })
  @ApiResponse({ status: 404, description: 'ApplicationNote or Application not found' })
  updateApplicationNote(
    @Param('id') id: string,
    @Body() updateApplicationNoteDto: UpdateApplicationNoteDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.applicationNoteService.updateOne(id, updateApplicationNoteDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an application note' })
  @ApiParam({ name: 'id', description: 'ApplicationNote ID' })
  @ApiResponse({ status: 204, description: 'ApplicationNote deleted' })
  @ApiResponse({ status: 404, description: 'ApplicationNote not found' })
  async deleteApplicationNote(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ): Promise<void> {
    return this.applicationNoteService.deleteOne(id, userId);
  }
}
