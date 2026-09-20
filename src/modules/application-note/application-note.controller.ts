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
import { ApplicationNote } from '../../common/entities/application-note.entity.js';
import { ApplicationNoteService } from './application-note.service.js';
import { CreateApplicationNoteDto } from './dto/create-application-note.dto.js';
import { UpdateApplicationNoteDto } from './dto/update-application-note.dto.js';

@ApiTags('ApplicationNotes')
@Controller('application-notes')
export class ApplicationNoteController {
  constructor(private readonly applicationNoteService: ApplicationNoteService) {}

  @Get()
  @ApiOperation({ summary: 'Get all application notes' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of application notes',
    type: PaginatedResponse(ApplicationNote),
  })
  getApplicationNotes(@Query() paginationQuery: PaginationQueryDto) {
    return this.applicationNoteService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an application note by id' })
  @ApiParam({ name: 'id', description: 'ApplicationNote ID' })
  @ApiResponse({ status: 200, description: 'The found application note', type: ApplicationNote })
  @ApiResponse({ status: 404, description: 'ApplicationNote not found' })
  getApplicationNote(@Param('id') id: string) {
    return this.applicationNoteService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new application note' })
  @ApiResponse({ status: 201, description: 'ApplicationNote created' })
  createApplicationNote(@Body() createApplicationNoteDto: CreateApplicationNoteDto) {
    return this.applicationNoteService.createApplicationNote(createApplicationNoteDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an application note' })
  @ApiParam({ name: 'id', description: 'ApplicationNote ID' })
  @ApiResponse({ status: 200, description: 'ApplicationNote updated' })
  updateApplicationNote(
    @Param('id') id: string,
    @Body() updateApplicationNoteDto: UpdateApplicationNoteDto,
  ) {
    return this.applicationNoteService.updateOne(id, updateApplicationNoteDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete an application note' })
  @ApiParam({ name: 'id', description: 'ApplicationNote ID' })
  @ApiResponse({ status: 200, description: 'ApplicationNote deleted' })
  async deleteApplicationNote(@Param('id') id: string): Promise<void> {
    return this.applicationNoteService.deleteOne(id);
  }
}
