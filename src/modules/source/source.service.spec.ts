import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';
import { SourceService } from './source.service.js';

const SOURCE_SELECT = {
  id: true,
  name: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';
const SEEDED_ID = 'seeded-1';
const OWNED_ID = 'owned-1';

describe('SourceService', () => {
  let service: SourceService;

  const prismaService = {
    source: {
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
        SourceService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<SourceService>(SourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSource', () => {
    it('should create a source with ownerId from token and isVerified false', async () => {
      const dto: CreateSourceDto = { name: 'LinkedIn' };
      prismaService.source.findFirst.mockResolvedValue(null);
      const created = {
        id: 'source-1',
        name: 'LinkedIn',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.source.create.mockResolvedValue(created);

      const result = await service.createSource(dto, USER_ID);

      expect(prismaService.source.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ ownerId: null }, { ownerId: USER_ID }],
          name: { equals: 'LinkedIn', mode: 'insensitive' },
        },
        select: { id: true },
      });
      expect(prismaService.source.create).toHaveBeenCalledWith({
        data: {
          name: 'LinkedIn',
          ownerId: USER_ID,
          isVerified: false,
        },
        select: SOURCE_SELECT,
      });
      expect(result).toEqual(created);
    });

    it('should throw ConflictException if visible name already exists (case-insensitive)', async () => {
      const dto: CreateSourceDto = { name: 'linkedin' };
      prismaService.source.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.createSource(dto, USER_ID)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.createSource(dto, USER_ID)).rejects.toThrow(
        'Source with name "linkedin" already exists',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated sources filtered by visibleTo', async () => {
      const paginationQuery: PaginationQueryDto = { page: 2, limit: 10 };
      const sources = [
        {
          id: 'source-1',
          name: 'LinkedIn',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      prismaService.source.findMany.mockResolvedValue(sources);
      prismaService.source.count.mockResolvedValue(25);

      const result = await service.findAll(paginationQuery, USER_ID);

      expect(prismaService.source.findMany).toHaveBeenCalledWith({
        where: { OR: [{ ownerId: null }, { ownerId: USER_ID }] },
        skip: 10,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: SOURCE_SELECT,
      });
      expect(prismaService.source.count).toHaveBeenCalledWith({
        where: { OR: [{ ownerId: null }, { ownerId: USER_ID }] },
      });
      expect(result).toEqual({ total: 25, data: sources });
    });
  });

  describe('findOne', () => {
    it('should return a source by id when visible', async () => {
      const source = {
        id: OWNED_ID,
        name: 'LinkedIn',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.source.findFirst.mockResolvedValue(source);

      const result = await service.findOne(OWNED_ID, USER_ID);

      expect(prismaService.source.findFirst).toHaveBeenCalledWith({
        where: { id: OWNED_ID, OR: [{ ownerId: null }, { ownerId: USER_ID }] },
        select: SOURCE_SELECT,
      });
      expect(result).toEqual(source);
    });

    it('should throw NotFoundException when not visible (other user)', async () => {
      prismaService.source.findFirst.mockResolvedValue(null);

      await expect(service.findOne(OWNED_ID, OTHER_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateOne', () => {
    it('should update owned source', async () => {
      const dto: UpdateSourceDto = { name: 'Indeed' };
      prismaService.source.findFirst
        .mockResolvedValueOnce({ ownerId: USER_ID })
        .mockResolvedValueOnce(null);
      const updated = {
        id: OWNED_ID,
        name: 'Indeed',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.source.update.mockResolvedValue(updated);

      const result = await service.updateOne(OWNED_ID, dto, USER_ID);

      expect(prismaService.source.update).toHaveBeenCalledWith({
        where: { id: OWNED_ID },
        data: { name: 'Indeed' },
        select: SOURCE_SELECT,
      });
      expect(result).toEqual(updated);
    });

    it('should throw ForbiddenException for seeded (ownerId null)', async () => {
      prismaService.source.findFirst.mockResolvedValue({ ownerId: null });

      await expect(
        service.updateOne(SEEDED_ID, { name: 'x' }, USER_ID),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException for other user resource', async () => {
      prismaService.source.findFirst.mockResolvedValue(null);

      await expect(
        service.updateOne(OWNED_ID, { name: 'x' }, OTHER_USER_ID),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException on duplicate name', async () => {
      prismaService.source.findFirst
        .mockResolvedValueOnce({ ownerId: USER_ID })
        .mockResolvedValueOnce({ id: 'other' });

      await expect(
        service.updateOne(OWNED_ID, { name: 'Duplicate' }, USER_ID),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('deleteOne', () => {
    it('should delete owned source', async () => {
      prismaService.source.findFirst.mockResolvedValue({ ownerId: USER_ID });
      prismaService.source.delete.mockResolvedValue({ id: OWNED_ID } as never);

      await service.deleteOne(OWNED_ID, USER_ID);

      expect(prismaService.source.delete).toHaveBeenCalledWith({
        where: { id: OWNED_ID },
      });
    });

    it('should throw ForbiddenException for seeded', async () => {
      prismaService.source.findFirst.mockResolvedValue({ ownerId: null });

      await expect(service.deleteOne(SEEDED_ID, USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFound for other user', async () => {
      prismaService.source.findFirst.mockResolvedValue(null);

      await expect(service.deleteOne(OWNED_ID, OTHER_USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
