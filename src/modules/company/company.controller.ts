import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Company } from '../../common/entities/company.entity.js';
import { CompanyService } from './company.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all companies visible to the current user (seeded + own)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of companies',
    type: PaginatedResponse(Company),
  })
  getCompanies(
    @Query() paginationQuery: PaginationQueryDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.companyService.findAll(paginationQuery, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by id' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'The found company', type: Company })
  @ApiResponse({ status: 404, description: 'Company not found' })
  getCompany(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.companyService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company owned by the current user' })
  @ApiResponse({ status: 201, description: 'Company created', type: Company })
  createCompany(
    @Body() createCompanyDto: CreateCompanyDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.companyService.createCompany(createCompanyDto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a company you own' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company updated', type: Company })
  @ApiResponse({ status: 403, description: 'Company is read-only (seeded)' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  updateCompany(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
    @CurrentUser('userId') userId: string,
  ) {
    return this.companyService.updateCompany(id, updateCompanyDto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company you own' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company deleted' })
  @ApiResponse({ status: 403, description: 'Company is read-only (seeded)' })
  @ApiResponse({ status: 404, description: 'Company not found' })
  deleteCompany(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
  ) {
    return this.companyService.remove(id, userId);
  }
}
