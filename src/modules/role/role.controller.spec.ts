import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { Role } from '../../common/entities/role.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { RoleController } from './role.controller.js';
import { RoleService } from './role.service.js';

const mockRole: Role = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ownerId: 'user-1',
  name: 'Backend Engineer',
  isVerified: false,
  createdAt: new Date('2026-09-14T10:55:11.715Z'),
  updatedAt: new Date('2026-09-14T10:55:11.715Z'),
};

const USER_ID = 'user-1';

describe('RoleController', () => {
  let controller: RoleController;
  let service: RoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        RoleService,
        {
          provide: PrismaService,
          useValue: {
            role: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
          },
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRoles', () => {
    it('should return paginated roles', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({ total: 1, data: [mockRole] });
      const result = await controller.getRoles({ page: 1, limit: 10 }, USER_ID);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, USER_ID);
      expect(result).toEqual({ total: 1, data: [mockRole] });
    });
  });

  describe('getRole', () => {
    it('should return a role by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockRole);
      const result = await controller.getRole(mockRole.id, USER_ID);
      expect(service.findOne).toHaveBeenCalledWith(mockRole.id, USER_ID);
      expect(result).toEqual(mockRole);
    });

    it('should propagate NotFoundException', async () => {
      vi.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Role with id 999 not found'));
      await expect(controller.getRole('999', USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createRole', () => {
    it('should create a role', async () => {
      const dto = { name: 'Backend Engineer' };
      vi.spyOn(service, 'createRole').mockResolvedValue(mockRole);
      const result = await controller.createRole(dto, USER_ID);
      expect(service.createRole).toHaveBeenCalledWith(dto, USER_ID);
      expect(result).toEqual(mockRole);
    });
  });

  describe('updateRole', () => {
    it('should update a role', async () => {
      const dto = { name: 'Frontend Engineer' };
      const updated = { ...mockRole, name: 'Frontend Engineer' };
      vi.spyOn(service, 'updateOne').mockResolvedValue(updated);
      const result = await controller.updateRole(mockRole.id, dto, USER_ID);
      expect(service.updateOne).toHaveBeenCalledWith(mockRole.id, dto, USER_ID);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteRole', () => {
    it('should delete a role', async () => {
      vi.spyOn(service, 'deleteOne').mockResolvedValue(undefined);
      await controller.deleteRole(mockRole.id, USER_ID);
      expect(service.deleteOne).toHaveBeenCalledWith(mockRole.id, USER_ID);
    });
  });
});
