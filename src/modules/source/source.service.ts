import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';

const sourceSelect = {
  id: true,
  ownerId: true,
  name: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SourceSelect;

@Injectable()
export class SourceService {
  constructor(private readonly prismaService: PrismaService) {}

  private visibleTo(userId: string): Prisma.SourceWhereInput {
    return { OR: [{ ownerId: null }, { ownerId: userId }] };
  }

  private async assertOwned(id: string, userId: string) {
    const source = await this.prismaService.source.findFirst({
      where: { id, ...this.visibleTo(userId) },
      select: { ownerId: true },
    });

    if (!source) {
      throw new NotFoundException(`Source with id ${id} not found`);
    }
    if (source.ownerId !== userId) {
      throw new ForbiddenException('You cannot modify this source');
    }
  }

  private async checkNameConflict(name: string, userId: string, excludeId?: string) {
    const existing = await this.prismaService.source.findFirst({
      where: {
        ...this.visibleTo(userId),
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(`Source with name "${name}" already exists`);
    }
  }

  async createSource(createSourceDto: CreateSourceDto, userId: string) {
    await this.checkNameConflict(createSourceDto.name, userId);

    return this.prismaService.source.create({
      data: {
        name: createSourceDto.name,
        ownerId: userId,
        isVerified: false,
      },
      select: sourceSelect,
    });
  }

  async findAll(paginationQuery: PaginationQueryDto, userId: string) {
    const { page, limit } = paginationQuery;
    const where = this.visibleTo(userId);

    const [data, total] = await Promise.all([
      this.prismaService.source.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: sourceSelect,
      }),
      this.prismaService.source.count({ where }),
    ]);

    return { total, data };
  }

  async findOne(id: string, userId: string) {
    const source = await this.prismaService.source.findFirst({
      where: { id, ...this.visibleTo(userId) },
      select: sourceSelect,
    });

    if (!source) {
      throw new NotFoundException(`Source with id ${id} not found`);
    }
    return source;
  }

  async updateOne(id: string, updateSourceDto: UpdateSourceDto, userId: string) {
    await this.assertOwned(id, userId);

    if (updateSourceDto.name !== undefined) {
      await this.checkNameConflict(updateSourceDto.name, userId, id);
    }

    return this.prismaService.source.update({
      where: { id },
      data: {
        name: updateSourceDto?.name,
      },
      select: sourceSelect,
    });
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    await this.assertOwned(id, userId);
    await this.prismaService.source.delete({ where: { id } });
  }
}
