import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Company } from '../../common/entities/company.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';

@Injectable()
export class CompanyService {
  constructor(private readonly prismaService: PrismaService) {}

  async createCompany(createCompanyDto: CreateCompanyDto) {
    return this.prismaService.company.create({
      data: {
        name: createCompanyDto.name,
        normalizedName: createCompanyDto.normalizedName,
        domain: createCompanyDto.domain,
        location: createCompanyDto.location,
        logoUrl: createCompanyDto.logoUrl,
        ownerId: createCompanyDto.ownerId,
        isVerified: !createCompanyDto.ownerId,
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        normalizedName: true,
        domain: true,
        location: true,
        logoUrl: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Promise<Company>;
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ total: number; data: Company[] }> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaService.company.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          normalizedName: true,
          domain: true,
          location: true,
          logoUrl: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }) as unknown as Promise<Company[]>,
      this.prismaService.company.count(),
    ]);

    return { total, data };
  }

  async findOne(id: string): Promise<Company> {
    const company = (await this.prismaService.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        normalizedName: true,
        domain: true,
        location: true,
        logoUrl: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    })) as unknown as Company | null;
    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }

  async updateCompany(id: string, updateCompanyDto: UpdateCompanyDto) {
    return this.prismaService.company.update({
      where: { id },
      data: {
        name: updateCompanyDto?.name,
        normalizedName: updateCompanyDto?.normalizedName,
        domain: updateCompanyDto?.domain,
        location: updateCompanyDto?.location,
        logoUrl: updateCompanyDto?.logoUrl,
        isVerified: updateCompanyDto?.isVerified,
      },
    });
  }

  async remove(id: string) {
    await this.prismaService.company.delete({
      where: { id },
    });
  }
}
