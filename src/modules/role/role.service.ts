import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

const roleSelect = {
  id: true,
  ownerId: true,
  name: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RoleSelect;

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}

  private visibleTo(userId: string): Prisma.RoleWhereInput {
    return { OR: [{ ownerId: null }, { ownerId: userId }] };
  }

  private async assertOwned(id: string, userId: string) {
    const role = await this.prismaService.role.findFirst({
      where: { id, ...this.visibleTo(userId) },
      select: { ownerId: true },
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    if (role.ownerId !== userId) {
      throw new ForbiddenException('You cannot modify this role');
    }
  }

  private async checkNameConflict(name: string, userId: string, excludeId?: string) {
    const existing = await this.prismaService.role.findFirst({
      where: {
        ...this.visibleTo(userId),
        name: { equals: name, mode: 'insensitive' },
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException(`Role with name "${name}" already exists`);
    }
  }

  async createRole(createRoleDto: CreateRoleDto, userId: string) {
    await this.checkNameConflict(createRoleDto.name, userId);

    return this.prismaService.role.create({
      data: {
        name: createRoleDto.name,
        ownerId: userId,
        isVerified: false,
      },
      select: roleSelect,
    });
  }

  async findAll(paginationQuery: PaginationQueryDto, userId: string) {
    const { page, limit } = paginationQuery;
    const where = this.visibleTo(userId);

    const [data, total] = await Promise.all([
      this.prismaService.role.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: roleSelect,
      }),
      this.prismaService.role.count({ where }),
    ]);

    return { total, data };
  }

  async findOne(id: string, userId: string) {
    const role = await this.prismaService.role.findFirst({
      where: { id, ...this.visibleTo(userId) },
      select: roleSelect,
    });

    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  async updateOne(id: string, updateRoleDto: UpdateRoleDto, userId: string) {
    await this.assertOwned(id, userId);

    if (updateRoleDto.name !== undefined) {
      await this.checkNameConflict(updateRoleDto.name, userId, id);
    }

    return this.prismaService.role.update({
      where: { id },
      data: {
        name: updateRoleDto?.name,
      },
      select: roleSelect,
    });
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    await this.assertOwned(id, userId);
    await this.prismaService.role.delete({ where: { id } });
  }
}
