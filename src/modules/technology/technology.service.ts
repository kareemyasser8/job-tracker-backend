import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Technology } from '../../common/entities/technology.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateTechnologyDto } from './dto/create-technology.dto.js';
import { UpdateTechnologyDto } from './dto/update-technology.dto.js';

@Injectable()
export class TechnologyService {
  constructor(private readonly prismaService: PrismaService) {}

  async createTechnology(createTechnologyDto: CreateTechnologyDto): Promise<Technology> {
    return this.prismaService.technology.create({
      data: {
        name: createTechnologyDto.name,
        ownerId: createTechnologyDto.ownerId,
        isVerified: !createTechnologyDto.ownerId,
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Promise<Technology>;
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ total: number; data: Technology[] }> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaService.technology.findMany({
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
      }) as unknown as Promise<Technology[]>,
      this.prismaService.technology.count(),
    ]);

    return { total, data };
  }

  async findOne(id: string): Promise<Technology> {
    const technology = (await this.prismaService.technology.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })) as unknown as Technology | null;
    if (!technology) {
      throw new NotFoundException(`Technology with id ${id} not found`);
    }
    return technology;
  }

  async updateOne(id: string, updateTechnologyDto: UpdateTechnologyDto): Promise<Technology> {
    return this.prismaService.technology.update({
      where: { id },
      data: {
        name: updateTechnologyDto?.name,
        ownerId: updateTechnologyDto?.ownerId,
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Promise<Technology>;
  }

  async deleteOne(id: string): Promise<void> {
    await this.prismaService.technology.delete({
      where: { id },
    });
  }
}
