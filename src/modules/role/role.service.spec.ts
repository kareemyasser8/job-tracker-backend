import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateRoleDto } from './dto/create-role.dto.js';
import { UpdateRoleDto } from './dto/update-role.dto.js';
import { RoleService } from './role.service.js';

const ROLE_SELECT = {
  id: true,
  name: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';

describe('RoleService', () => {
  let service: RoleService;

  const prismaService = {
    role: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoleService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();
    service = module.get<RoleService>(RoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it('should create with ownerId from token and isVerified false', async () => {
      prismaService.role.findFirst.mockResolvedValue(null);
      const created = { id: 'role-1', name: 'Backend', isVerified: false, createdAt: new Date(), updatedAt: new Date() };
      prismaService.role.create.mockResolvedValue(created);

      const result = await service.createRole({ name: 'Backend' }, USER_ID);

      expect(prismaService.role.findFirst).toHaveBeenCalledWith({
        where: { OR: [{ ownerId: null }, { ownerId: USER_ID }], name: { equals: 'Backend', mode: 'insensitive' } },
        select: { id: true },
      });
      expect(prismaService.role.create).toHaveBeenCalledWith({
        data: { name: 'Backend', ownerId: USER_ID, isVerified: false },
        select: ROLE_SELECT,
      });
      expect(result).toEqual(created);
    });

    it('should throw ConflictException on duplicate visible name', async () => {
      prismaService.role.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(service.createRole({ name: 'backend' } as CreateRoleDto, USER_ID)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should use visibleTo for both findMany and count', async () => {
      const q: PaginationQueryDto = { page: 1, limit: 10 };
      prismaService.role.findMany.mockResolvedValue([]);
      prismaService.role.count.mockResolvedValue(0);
      const result = await service.findAll(q, USER_ID);
      const where = { OR: [{ ownerId: null }, { ownerId: USER_ID }] };
      expect(prismaService.role.findMany).toHaveBeenCalledWith({ where, skip: 0, take: 10, orderBy: { createdAt: 'desc' }, select: ROLE_SELECT });
      expect(prismaService.role.count).toHaveBeenCalledWith({ where });
      expect(result).toEqual({ total: 0, data: [] });
    });
  });

  describe('findOne', () => {
    it('should return visible role', async () => {
      const role = { id: 'role-1', name: 'Backend', isVerified: false, createdAt: new Date(), updatedAt: new Date() };
      prismaService.role.findFirst.mockResolvedValue(role);
      const result = await service.findOne('role-1', USER_ID);
      expect(result).toEqual(role);
    });

    it('should throw NotFound for invisible', async () => {
      prismaService.role.findFirst.mockResolvedValue(null);
      await expect(service.findOne('role-1', OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOne', () => {
    it('should update owned role', async () => {
      prismaService.role.findFirst.mockResolvedValueOnce({ ownerId: USER_ID }).mockResolvedValueOnce(null);
      const updated = { id: 'role-1', name: 'Updated', isVerified: false, createdAt: new Date(), updatedAt: new Date() };
      prismaService.role.update.mockResolvedValue(updated);
      const result = await service.updateOne('role-1', { name: 'Updated' } as UpdateRoleDto, USER_ID);
      expect(result).toEqual(updated);
    });

    it('should throw Forbidden for seeded', async () => {
      prismaService.role.findFirst.mockResolvedValue({ ownerId: null });
      await expect(service.updateOne('seeded', { name: 'x' } as UpdateRoleDto, USER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFound for other user', async () => {
      prismaService.role.findFirst.mockResolvedValue(null);
      await expect(service.updateOne('role-1', { name: 'x' } as UpdateRoleDto, OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw Conflict on duplicate name on update', async () => {
      prismaService.role.findFirst.mockResolvedValueOnce({ ownerId: USER_ID }).mockResolvedValueOnce({ id: 'other' });
      await expect(service.updateOne('role-1', { name: 'Backend' } as UpdateRoleDto, USER_ID)).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteOne', () => {
    it('should delete owned', async () => {
      prismaService.role.findFirst.mockResolvedValue({ ownerId: USER_ID });
      prismaService.role.delete.mockResolvedValue({ id: 'role-1' } as never);
      await service.deleteOne('role-1', USER_ID);
      expect(prismaService.role.delete).toHaveBeenCalledWith({ where: { id: 'role-1' } });
    });

    it('should throw Forbidden for seeded', async () => {
      prismaService.role.findFirst.mockResolvedValue({ ownerId: null });
      await expect(service.deleteOne('seeded', USER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFound for invisible', async () => {
      prismaService.role.findFirst.mockResolvedValue(null);
      await expect(service.deleteOne('role-1', OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
