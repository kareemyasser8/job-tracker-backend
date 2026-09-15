import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(createUserDto: CreateUserDto) {
    return this.prismaService.user.create({
      data: {
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        passwordHash: createUserDto.password,
      },
    });
  }

  async findAll() {
    return this.prismaService.user.findMany();
  }

  async findOne(id: string) {
    return this.prismaService.user.findUnique({ where: { id } });
  }

  async updateOne(id: string, updateUserDto: UpdateUserDto) {
    return this.prismaService.user.update({
      where: {
        id,
      },
      data: {
        firstName: updateUserDto?.firstName,
        lastName: updateUserDto?.lastName,
        email: updateUserDto?.email,
        passwordHash: updateUserDto?.password,
      },
    });
  }
}
