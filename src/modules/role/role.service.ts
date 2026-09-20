import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Role } from '../../common/entities/role.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';

@Injectable()
export class RoleService {
  constructor(private readonly prismaService: PrismaService) {}

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    return this.prismaService.role.create({
      data: {
        name: createRoleDto.name,
        ownerId: createRoleDto.ownerId,
        isVerified: !createRoleDto.ownerId,
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Promise<Role>;
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ total: number; data: Role[] }> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaService.role.findMany({
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
      }) as unknown as Promise<Role[]>,
      this.prismaService.role.count(),
    ]);

    return { total, data };
  }

  async findOne(id: string): Promise<Role> {
    const role = (await this.prismaService.role.findUnique({
      where: { id },
      select: {
        id: true,
        ownerId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    })) as unknown as Role | null;
    if (!role) {
      throw new NotFoundException(`Role with id ${id} not found`);
    }
    return role;
  }

  async updateOne(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    return this.prismaService.role.update({
      where: { id },
      data: {
        name: updateRoleDto?.name,
        ownerId: updateRoleDto?.ownerId,
      },
      select: {
        id: true,
        ownerId: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    }) as unknown as Promise<Role>;
  }

  async deleteOne(id: string): Promise<void> {
    await this.prismaService.role.delete({
      where: { id },
    });
  }
}
