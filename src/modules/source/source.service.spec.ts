import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateSourceDto } from './dto/create-source.dto.js';
import { UpdateSourceDto } from './dto/update-source.dto.js';
import { SourceService } from './source.service.js';

const SOURCE_SELECT = {
  id: true,
  ownerId: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

describe('SourceService', () => {
  let service: SourceService;

  const prismaService = {
    source: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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
    it('should create a source', async () => {
      const createSourceDto: CreateSourceDto = {
        name: 'LinkedIn',
      };

      const createdSource = {
        id: 'source-1',
        ownerId: null,
        name: 'LinkedIn',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.source.create.mockResolvedValue(createdSource);

      const result = await service.createSource(createSourceDto);

      expect(prismaService.source.create).toHaveBeenCalledWith({
        data: {
          name: 'LinkedIn',
          ownerId: undefined,
        },
        select: SOURCE_SELECT,
      });

      expect(result).toEqual(createdSource);
    });
  });

  describe('findAll', () => {
    it('should return paginated sources', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 2,
        limit: 10,
      };

      const sources = [
        {
          id: 'source-1',
          ownerId: null,
          name: 'LinkedIn',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'source-2',
          ownerId: null,
          name: 'Indeed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaService.source.findMany.mockResolvedValue(sources);
      prismaService.source.count.mockResolvedValue(25);

      const result = await service.findAll(paginationQuery);

      expect(prismaService.source.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: SOURCE_SELECT,
      });

      expect(prismaService.source.count).toHaveBeenCalledWith();

      expect(result).toEqual({
        total: 25,
        data: sources,
      });
    });

    it('should calculate skip correctly for the first page', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 1,
        limit: 20,
      };

      prismaService.source.findMany.mockResolvedValue([]);
      prismaService.source.count.mockResolvedValue(0);

      await service.findAll(paginationQuery);

      expect(prismaService.source.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a source by id', async () => {
      const source = {
        id: 'source-1',
        ownerId: null,
        name: 'LinkedIn',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.source.findUnique.mockResolvedValue(source);

      const result = await service.findOne('source-1');

      expect(prismaService.source.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'source-1',
        },
        select: SOURCE_SELECT,
      });

      expect(result).toEqual(source);
    });

    it('should throw NotFoundException when source does not exist', async () => {
      prismaService.source.findUnique.mockResolvedValue(null);

      await expect(service.findOne('source-999')).rejects.toThrow(
        new NotFoundException('Source with id source-999 not found'),
      );
    });
  });

  describe('updateOne', () => {
    it('should update a source', async () => {
      const updateSourceDto: UpdateSourceDto = {
        name: 'UpdatedSource',
      };

      const updatedSource = {
        id: 'source-1',
        ownerId: null,
        name: 'UpdatedSource',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.source.update.mockResolvedValue(updatedSource);

      const result = await service.updateOne('source-1', updateSourceDto);

      expect(prismaService.source.update).toHaveBeenCalledWith({
        where: { id: 'source-1' },
        data: {
          name: 'UpdatedSource',
          ownerId: undefined,
        },
        select: SOURCE_SELECT,
      });

      expect(result).toEqual(updatedSource);
    });

    it('should update only provided fields', async () => {
      const updateSourceDto: UpdateSourceDto = {
        name: 'Updated',
      };

      const updatedSource = {
        id: 'source-1',
        ownerId: null,
        name: 'Updated',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaService.source.update.mockResolvedValue(updatedSource);

      const result = await service.updateOne('source-1', updateSourceDto);

      expect(prismaService.source.update).toHaveBeenCalledWith({
        where: {
          id: 'source-1',
        },
        data: {
          name: 'Updated',
          ownerId: undefined,
        },
        select: SOURCE_SELECT,
      });

      expect(result).toEqual(updatedSource);
    });
  });
});
