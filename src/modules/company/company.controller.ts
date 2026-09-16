import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { PaginatedResponse } from '../../common/dto/paginated-response.dto.js';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Company } from '../../common/entities/company.entity.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';
import { CompanyService } from './company.service.js';

@ApiTags('Companies')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of companies',
    type: PaginatedResponse(Company),
  })
  getCompanies(@Query() paginationQuery: PaginationQueryDto) {
    return this.companyService.findAll(paginationQuery);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a company by id' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'The found company', type: Company })
  @ApiResponse({ status: 404, description: 'Company not found' })
  getCompany(@Param('id') id: string) {
    return this.companyService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  @ApiResponse({ status: 201, description: 'Company created' })
  createCompany(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companyService.createCompany(createCompanyDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company updated' })
  updateCompany(@Param('id') id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
    return this.companyService.updateCompany(id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a company' })
  @ApiParam({ name: 'id', description: 'Company ID' })
  @ApiResponse({ status: 200, description: 'Company deleted' })
  deleteCompany(@Param('id') id: string) {
    return this.companyService.remove(id);
  }
}