import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Source } from '../../common/entities/source.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';

@Injectable()
export class SourceService {
  constructor(private readonly prismaService: PrismaService) {}

  async createSource(createSourceDto: CreateSourceDto): Promise<Source> {
    return this.prismaService.source.create({
      data: {
        name: createSourceDto.name,
        ownerId: createSourceDto.ownerId,
        isVerified: !createSourceDto.ownerId,
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Promise<Source>;
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ total: number; data: Source[] }> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaService.source.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          ownerId: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }) as unknown as Promise<Source[]>,
      this.prismaService.source.count(),
    ]);

    return { total, data };
  }

  async findOne(id: string): Promise<Source> {
    const source = (await this.prismaService.source.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })) as unknown as Source | null;
    if (!source) {
      throw new NotFoundException(`Source with id ${id} not found`);
    }
    return source;
  }

  async updateOne(id: string, updateSourceDto: UpdateSourceDto): Promise<Source> {
    return this.prismaService.source.update({
      where: { id },
      data: {
        name: updateSourceDto?.name,
        ownerId: updateSourceDto?.ownerId,
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Promise<Source>;
  }

  async deleteOne(id: string): Promise<void> {
    await this.prismaService.source.delete({
      where: { id },
    });
  }
}
