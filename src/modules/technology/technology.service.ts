import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateTechnologyDto } from './dto/create-technology.dto.js';
import { UpdateTechnologyDto } from './dto/update-technology.dto.js';

const technologySelect = {
  id: true,
  name: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.TechnologySelect;

@Injectable()
export class TechnologyService {
  constructor(private readonly prismaService: PrismaService) {}

  private visibleTo(userId: string): Prisma.TechnologyWhereInput {
    return { OR: [{ ownerId: null }, { ownerId: userId }] };
  }

  private async assertOwned(id: string, userId: string) {
    const technology = await this.prismaService.technology.findFirst({
      where: { id, ...this.visibleTo(userId) },
      select: { ownerId: true },
    });

    if (!technology) {
      throw new NotFoundException(`Technology with id ${id} not found`);
    }
    if (technology.ownerId !== userId) {
      throw new ForbiddenException('You cannot modify this technology');
    }
  }

  private async checkNameConflict(name: string, userId: string, excludeId?: string) {
    const existing = await this.prismaService.technology.findFirst({
      where: {
        ...this.visibleTo(userId),
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(`Technology with name "${name}" already exists`);
    }
  }

  async createTechnology(createTechnologyDto: CreateTechnologyDto, userId: string) {
    await this.checkNameConflict(createTechnologyDto.name, userId);

    return this.prismaService.technology.create({
      data: {
        name: createTechnologyDto.name,
        ownerId: userId,
        isVerified: false,
      },
      select: technologySelect,
    });
  }

  async findAll(paginationQuery: PaginationQueryDto, userId: string) {
    const { page, limit } = paginationQuery;
    const where = this.visibleTo(userId);

    const [data, total] = await Promise.all([
      this.prismaService.technology.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: technologySelect,
      }),
      this.prismaService.technology.count({ where }),
    ]);

    return { total, data };
  }

  async findOne(id: string, userId: string) {
    const technology = await this.prismaService.technology.findFirst({
      where: { id, ...this.visibleTo(userId) },
      select: technologySelect,
    });

    if (!technology) {
      throw new NotFoundException(`Technology with id ${id} not found`);
    }
    return technology;
  }

  async updateOne(id: string, updateTechnologyDto: UpdateTechnologyDto, userId: string) {
    await this.assertOwned(id, userId);

    if (updateTechnologyDto.name !== undefined) {
      await this.checkNameConflict(updateTechnologyDto.name, userId, id);
    }

    return this.prismaService.technology.update({
      where: { id },
      data: {
        name: updateTechnologyDto?.name,
      },
      select: technologySelect,
    });
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    await this.assertOwned(id, userId);
    await this.prismaService.technology.delete({ where: { id } });
  }
}
