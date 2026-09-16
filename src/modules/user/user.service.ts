import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { User } from '../../common/entities/user.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.prismaService.user.create({
      data: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        passwordHash: createUserDto.password,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ total: number; data: User[] }> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaService.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          createdAt: true,
        },
      }),
      this.prismaService.user.count(),
    ]);

    return { total, data };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.prismaService.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async updateOne(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    return this.prismaService.user.update({
      where: { id },
      data: {
        firstName: updateUserDto?.firstName,
        lastName: updateUserDto?.lastName,
        email: updateUserDto?.email,
        passwordHash: updateUserDto?.password,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        createdAt: true,
      },
    });
  }
}
