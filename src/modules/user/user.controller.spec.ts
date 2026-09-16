import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { User } from '../../common/entities/user.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';

// A single realistic fixture, reused so every test asserts against the
// same full shape the entity/Prisma select actually returns.
const mockUser: User = {
  id: '7073b39c-8e1d-4d40-86ac-d331a800c4ee',
  firstName: 'Jane',
  lastName: 'Doe',
  email: 'jane.doe@example.com',
  createdAt: new Date('2026-09-14T10:55:11.715Z'),
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
              count: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({
        total: 1,
        data: [mockUser],
      });

      const result = await controller.getUsers({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual({ total: 1, data: [mockUser] });
    });

    it('should return an empty page when there are no users', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({ total: 0, data: [] });

      const result = await controller.getUsers({ page: 1, limit: 10 });

      expect(result).toEqual({ total: 0, data: [] });
    });
  });

  describe('getUser', () => {
    it('should return a user by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockUser);

      const result = await controller.getUser(mockUser.id);

      expect(service.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should propagate NotFoundException for a missing user', async () => {
      vi.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException('User with id 999 not found'),
      );

      await expect(controller.getUser('999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getUser('999')).rejects.toThrow(
        'User with id 999 not found',
      );
    });
  });

  describe('createUser', () => {
    it('should create a user and return it', async () => {
      const dto = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        password: 'StrongPass123',
      };
      vi.spyOn(service, 'createUser').mockResolvedValue(mockUser);

      const result = await controller.createUser(dto);

      expect(service.createUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateUser', () => {
    it('should update a user and return the updated record', async () => {
      const dto = { firstName: 'Janet' };
      const updated = { ...mockUser, firstName: 'Janet' };
      vi.spyOn(service, 'updateOne').mockResolvedValue(updated);

      const result = await controller.updateUser(mockUser.id, dto);

      expect(service.updateOne).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toEqual(updated);
    });
  });
});
