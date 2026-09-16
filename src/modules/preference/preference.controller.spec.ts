import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PreferenceController } from './preference.controller.js';
import { PreferenceService } from './preference.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('PreferenceController', () => {
  let controller: PreferenceController;
  let service: PreferenceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreferenceController],
      providers: [
        PreferenceService,
        {
          provide: PrismaService,
          useValue: {
            preference: {
              findUnique: vi.fn(),
              upsert: vi.fn(),
              delete: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<PreferenceController>(PreferenceController);
    service = module.get<PreferenceService>(PreferenceService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPreference', () => {
    it('should return a preference by userId', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({ userId: '1', isDarkMode: true, isGridLayout: false });
      const result = await controller.getPreference('1');
      expect(result).toEqual({ userId: '1', isDarkMode: true, isGridLayout: false });
    });

    it('should throw 404 for missing preference', async () => {
      vi.spyOn(service, 'findOne').mockRejectedValue(new Error('Preference for user 999 not found'));
      await expect(controller.getPreference('999')).rejects.toThrow();
    });
  });

  describe('updatePreference', () => {
    it('should update or create a preference', async () => {
      vi.spyOn(service, 'updatePreference').mockResolvedValue({ userId: '1', isDarkMode: true, isGridLayout: true });
      const result = await controller.updatePreference('1', { isDarkMode: true });
      expect(result).toEqual({ userId: '1', isDarkMode: true, isGridLayout: true });
    });
  });

  describe('deletePreference', () => {
    it('should delete a preference', async () => {
      vi.spyOn(service, 'remove').mockResolvedValue(undefined);
      await controller.deletePreference('1');
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});