import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateTechnologyDto } from './dto/create-technology.dto.js';
import { UpdateTechnologyDto } from './dto/update-technology.dto.js';
import { TechnologyService } from './technology.service.js';

const TECHNOLOGY_SELECT = {
  id: true,
  name: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';

describe('TechnologyService', () => {
  let service: TechnologyService;

  const prismaService = {
    technology: {
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
      providers: [TechnologyService, { provide: PrismaService, useValue: prismaService }],
    }).compile();
    service = module.get<TechnologyService>(TechnologyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTechnology', () => {
    it('should create with ownerId from token', async () => {
      prismaService.technology.findFirst.mockResolvedValue(null);
      const created = { id: 'tech-1', name: 'TS', isVerified: false, createdAt: new Date(), updatedAt: new Date() };
      prismaService.technology.create.mockResolvedValue(created);
      const result = await service.createTechnology({ name: 'TS' } as CreateTechnologyDto, USER_ID);
      expect(prismaService.technology.create).toHaveBeenCalledWith({ data: { name: 'TS', ownerId: USER_ID, isVerified: false }, select: TECHNOLOGY_SELECT });
      expect(result).toEqual(created);
    });

    it('should throw Conflict on duplicate', async () => {
      prismaService.technology.findFirst.mockResolvedValue({ id: 'existing' });
      await expect(service.createTechnology({ name: 'TS' } as CreateTechnologyDto, USER_ID)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should use visibleTo for both queries', async () => {
      const q: PaginationQueryDto = { page: 1, limit: 10 };
      prismaService.technology.findMany.mockResolvedValue([]);
      prismaService.technology.count.mockResolvedValue(0);
      const result = await service.findAll(q, USER_ID);
      const where = { OR: [{ ownerId: null }, { ownerId: USER_ID }] };
      expect(prismaService.technology.findMany).toHaveBeenCalledWith({ where, skip: 0, take: 10, orderBy: { createdAt: 'desc' }, select: TECHNOLOGY_SELECT });
      expect(prismaService.technology.count).toHaveBeenCalledWith({ where });
      expect(result).toEqual({ total: 0, data: [] });
    });
  });

  describe('findOne', () => {
    it('should return visible', async () => {
      const tech = { id: 'tech-1', name: 'TS', isVerified: false, createdAt: new Date(), updatedAt: new Date() };
      prismaService.technology.findFirst.mockResolvedValue(tech);
      const result = await service.findOne('tech-1', USER_ID);
      expect(result).toEqual(tech);
    });

    it('should throw NotFound for invisible', async () => {
      prismaService.technology.findFirst.mockResolvedValue(null);
      await expect(service.findOne('tech-1', OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOne', () => {
    it('should update owned', async () => {
      prismaService.technology.findFirst.mockResolvedValueOnce({ ownerId: USER_ID }).mockResolvedValueOnce(null);
      const updated = { id: 'tech-1', name: 'JS', isVerified: false, createdAt: new Date(), updatedAt: new Date() };
      prismaService.technology.update.mockResolvedValue(updated);
      const result = await service.updateOne('tech-1', { name: 'JS' } as UpdateTechnologyDto, USER_ID);
      expect(result).toEqual(updated);
    });

    it('should throw Forbidden for seeded', async () => {
      prismaService.technology.findFirst.mockResolvedValue({ ownerId: null });
      await expect(service.updateOne('seeded', { name: 'x' } as UpdateTechnologyDto, USER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFound for other user', async () => {
      prismaService.technology.findFirst.mockResolvedValue(null);
      await expect(service.updateOne('tech-1', { name: 'x' } as UpdateTechnologyDto, OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw Conflict on duplicate name', async () => {
      prismaService.technology.findFirst.mockResolvedValueOnce({ ownerId: USER_ID }).mockResolvedValueOnce({ id: 'other' });
      await expect(service.updateOne('tech-1', { name: 'TS' } as UpdateTechnologyDto, USER_ID)).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteOne', () => {
    it('should delete owned', async () => {
      prismaService.technology.findFirst.mockResolvedValue({ ownerId: USER_ID });
      prismaService.technology.delete.mockResolvedValue({ id: 'tech-1' } as never);
      await service.deleteOne('tech-1', USER_ID);
      expect(prismaService.technology.delete).toHaveBeenCalledWith({ where: { id: 'tech-1' } });
    });

    it('should throw Forbidden for seeded', async () => {
      prismaService.technology.findFirst.mockResolvedValue({ ownerId: null });
      await expect(service.deleteOne('seeded', USER_ID)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFound for invisible', async () => {
      prismaService.technology.findFirst.mockResolvedValue(null);
      await expect(service.deleteOne('tech-1', OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
