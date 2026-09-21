import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { Source } from '../../common/entities/source.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SourceController } from './source.controller.js';
import { SourceService } from './source.service.js';

const mockSource: Source = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  ownerId: null,
  name: 'LinkedIn',
  isVerified: false,
  createdAt: new Date('2026-09-14T10:55:11.715Z'),
  updatedAt: new Date('2026-09-14T10:55:11.715Z'),
};

describe('SourceController', () => {
  let controller: SourceController;
  let service: SourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourceController],
      providers: [
        SourceService,
        {
          provide: PrismaService,
          useValue: {
            source: {
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

    controller = module.get<SourceController>(SourceController);
    service = module.get<SourceService>(SourceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSources', () => {
    it('should return paginated sources', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({
        total: 1,
        data: [mockSource],
      });

      const result = await controller.getSources({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual({ total: 1, data: [mockSource] });
    });

    it('should return an empty page when there are no sources', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({ total: 0, data: [] });

      const result = await controller.getSources({ page: 1, limit: 10 });

      expect(result).toEqual({ total: 0, data: [] });
    });
  });

  describe('getSource', () => {
    it('should return a source by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockSource);

      const result = await controller.getSource(mockSource.id);

      expect(service.findOne).toHaveBeenCalledWith(mockSource.id);
      expect(result).toEqual(mockSource);
    });

    it('should propagate NotFoundException for a missing source', async () => {
      vi.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException('Source with id 999 not found'),
      );

      await expect(controller.getSource('999')).rejects.toThrow(NotFoundException);
      await expect(controller.getSource('999')).rejects.toThrow('Source with id 999 not found');
    });
  });

  describe('createSource', () => {
    it('should create a source and return it', async () => {
      const dto = {
        name: 'LinkedIn',
      };
      vi.spyOn(service, 'createSource').mockResolvedValue(mockSource);

      const result = await controller.createSource(dto);

      expect(service.createSource).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockSource);
    });
  });

  describe('updateSource', () => {
    it('should update a source and return the updated record', async () => {
      const dto = { name: 'Indeed' };
      const updated = { ...mockSource, name: 'Indeed' };
      vi.spyOn(service, 'updateOne').mockResolvedValue(updated);

      const result = await controller.updateSource(mockSource.id, dto);

      expect(service.updateOne).toHaveBeenCalledWith(mockSource.id, dto);
      expect(result).toEqual(updated);
    });
  });
});
