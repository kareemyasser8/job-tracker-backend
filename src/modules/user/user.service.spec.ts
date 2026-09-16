import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { UserService } from './user.service.js';

const USER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  createdAt: true,
} as const;

describe('UserService', () => {
  let service: UserService;

  const prismaService = {
    $transaction: vi.fn(async (callback: (tx: any) => Promise<any>) => {
      const tx = {
        user: {
          create: vi.fn(),
        },
        preference: {
          create: vi.fn(),
        },
      };
      return callback(tx);
    }),
    user: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    preference: {
      create: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
      };

      const createdUser = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
      };

      // Access the transaction client mock
      const txMock = {
        user: {
          create: vi.fn().mockResolvedValue(createdUser),
        },
        preference: {
          create: vi.fn().mockResolvedValue({}),
        },
      };
      prismaService.$transaction.mockImplementation(async (callback) => callback(txMock));

      const result = await service.createUser(createUserDto);

      expect(txMock.user.create).toHaveBeenCalledWith({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          passwordHash: 'password123',
        },
        select: USER_SELECT,
      });

      expect(txMock.preference.create).toHaveBeenCalledWith({
        data: { userId: 'user-1' },
      });

      expect(result).toEqual(createdUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 2,
        limit: 10,
      };

      const users = [
        {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          createdAt: new Date(),
        },
        {
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          createdAt: new Date(),
        },
      ];

      prismaService.user.findMany.mockResolvedValue(users);
      prismaService.user.count.mockResolvedValue(25);

      const result = await service.findAll(paginationQuery);

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: USER_SELECT,
      });

      expect(prismaService.user.count).toHaveBeenCalledWith();

      expect(result).toEqual({
        total: 25,
        data: users,
      });
    });

    it('should calculate skip correctly for the first page', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 1,
        limit: 20,
      };

      prismaService.user.findMany.mockResolvedValue([]);
      prismaService.user.count.mockResolvedValue(0);

      await service.findAll(paginationQuery);

      expect(prismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const user = {
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
      };

      prismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.findOne('user-1');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        select: USER_SELECT,
      });

      expect(result).toEqual(user);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne('user-999')).rejects.toThrow(
        new NotFoundException('User with id user-999 not found'),
      );
    });
  });

  describe('updateOne', () => {
    it('should update a user', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com',
        password: 'newPassword123',
      };

      const updatedUser = {
        id: 'user-1',
        firstName: 'Updated',
        lastName: 'User',
        email: 'updated@example.com',
        createdAt: new Date(),
      };

      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateOne('user-1', updateUserDto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: {
          firstName: 'Updated',
          lastName: 'User',
          email: 'updated@example.com',
          passwordHash: 'newPassword123',
        },
        select: USER_SELECT,
      });

      expect(result).toEqual(updatedUser);
    });

    it('should update only provided fields', async () => {
      const updateUserDto: UpdateUserDto = {
        firstName: 'Updated',
      };

      const updatedUser = {
        id: 'user-1',
        firstName: 'Updated',
        lastName: 'Doe',
        email: 'john@example.com',
        createdAt: new Date(),
      };

      prismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateOne('user-1', updateUserDto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: {
          id: 'user-1',
        },
        data: {
          firstName: 'Updated',
          lastName: undefined,
          email: undefined,
          passwordHash: undefined,
        },
        select: USER_SELECT,
      });

      expect(result).toEqual(updatedUser);
    });
  });
});
