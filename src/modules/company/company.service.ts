import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateCompanyDto } from './dto/create-company.dto.js';
import { UpdateCompanyDto } from './dto/update-company.dto.js';

// Defined once and reused by every query so the response shape stays consistent.
const companySelect = {
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
} satisfies Prisma.CompanySelect;

@Injectable()
export class CompanyService {
  constructor(private readonly prismaService: PrismaService) {}

  // Seeded companies have ownerId = null, so they are visible to everyone.
  // Private companies are visible only to their owner.
  private visibleTo(userId: string): Prisma.CompanyWhereInput {
    return { OR: [{ ownerId: null }, { ownerId: userId }] };
  }

  // 404 if the company isn't visible to this user (doesn't exist or belongs to someone else).
  // 403 if it's visible but not owned by them (a seeded company, which is read-only).
  private async assertOwned(id: string, userId: string) {
    const company = await this.prismaService.company.findFirst({
      where: { id, ...this.visibleTo(userId) },
      select: { ownerId: true },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    if (company.ownerId !== userId) {
      throw new ForbiddenException('You cannot modify this company');
    }
  }

  async createCompany(dto: CreateCompanyDto, userId: string) {
    return this.prismaService.company.create({
      data: {
        name: dto.name,
        normalizedName: dto.normalizedName,
        domain: dto.domain,
        location: dto.location,
        logoUrl: dto.logoUrl,
        ownerId: userId, // always from the token, never from the request body
        isVerified: false, // user-created companies are never verified
      },
      select: companySelect,
    });
  }

  async findAll(paginationQuery: PaginationQueryDto, userId: string) {
    const { page, limit } = paginationQuery;
    const where = this.visibleTo(userId);

    const [data, total] = await Promise.all([
      this.prismaService.company.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: companySelect,
      }),
      // Same filter as findMany, otherwise the total would be wrong.
      this.prismaService.company.count({ where }),
    ]);

    return { total, data };
  }

  async findOne(id: string, userId: string) {
    const company = await this.prismaService.company.findFirst({
      where: { id, ...this.visibleTo(userId) },
      select: companySelect,
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found`);
    }
    return company;
  }

  async updateCompany(id: string, dto: UpdateCompanyDto, userId: string) {
    await this.assertOwned(id, userId);

    return this.prismaService.company.update({
      where: { id },
      data: {
        name: dto.name,
        normalizedName: dto.normalizedName,
        domain: dto.domain,
        location: dto.location,
        logoUrl: dto.logoUrl,
        // isVerified is intentionally not updatable by users
      },
      select: companySelect,
    });
  }

  async remove(id: string, userId: string) {
    await this.assertOwned(id, userId);
    await this.prismaService.company.delete({ where: { id } });
  }
}
