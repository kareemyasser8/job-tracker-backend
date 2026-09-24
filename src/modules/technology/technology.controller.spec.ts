import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { Technology } from '../../common/entities/technology.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TechnologyController } from './technology.controller.js';
import { TechnologyService } from './technology.service.js';

const mockTech: Technology = {
  id: 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b',
  ownerId: 'user-1',
  name: 'TypeScript',
  isVerified: false,
  createdAt: new Date('2026-09-14T10:55:11.715Z'),
  updatedAt: new Date('2026-09-14T10:55:11.715Z'),
};

const USER_ID = 'user-1';

describe('TechnologyController', () => {
  let controller: TechnologyController;
  let service: TechnologyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnologyController],
      providers: [
        TechnologyService,
        { provide: PrismaService, useValue: { technology: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() } } },
      ],
    }).compile();
    controller = module.get<TechnologyController>(TechnologyController);
    service = module.get<TechnologyService>(TechnologyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTechnologies', () => {
    it('should return paginated', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({ total: 1, data: [mockTech] });
      const result = await controller.getTechnologies({ page: 1, limit: 10 }, USER_ID);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, USER_ID);
      expect(result).toEqual({ total: 1, data: [mockTech] });
    });
  });

  describe('getTechnology', () => {
    it('should return by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockTech);
      const result = await controller.getTechnology(mockTech.id, USER_ID);
      expect(service.findOne).toHaveBeenCalledWith(mockTech.id, USER_ID);
      expect(result).toEqual(mockTech);
    });

    it('should propagate NotFound', async () => {
      vi.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Technology with id 999 not found'));
      await expect(controller.getTechnology('999', USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTechnology', () => {
    it('should create', async () => {
      const dto = { name: 'TypeScript' };
      vi.spyOn(service, 'createTechnology').mockResolvedValue(mockTech);
      const result = await controller.createTechnology(dto, USER_ID);
      expect(service.createTechnology).toHaveBeenCalledWith(dto, USER_ID);
      expect(result).toEqual(mockTech);
    });
  });

  describe('updateTechnology', () => {
    it('should update', async () => {
      const dto = { name: 'JavaScript' };
      const updated = { ...mockTech, name: 'JavaScript' };
      vi.spyOn(service, 'updateOne').mockResolvedValue(updated);
      const result = await controller.updateTechnology(mockTech.id, dto, USER_ID);
      expect(service.updateOne).toHaveBeenCalledWith(mockTech.id, dto, USER_ID);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteTechnology', () => {
    it('should delete', async () => {
      vi.spyOn(service, 'deleteOne').mockResolvedValue(undefined);
      await controller.deleteTechnology(mockTech.id, USER_ID);
      expect(service.deleteOne).toHaveBeenCalledWith(mockTech.id, USER_ID);
    });
  });
});
