import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PreferenceController } from './preference.controller.js';
import { PreferenceService } from './preference.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

const USER_ID = 'user-1';

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
            preference: { findUnique: vi.fn(), upsert: vi.fn() },
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
    it('should return preference for current user', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue({ isDarkMode: true, isGridLayout: false } as any);
      const result = await controller.getPreference(USER_ID);
      expect(service.findOne).toHaveBeenCalledWith(USER_ID);
      expect(result).toEqual({ isDarkMode: true, isGridLayout: false });
    });

    it('should throw 404 for missing preference', async () => {
      vi.spyOn(service, 'findOne').mockRejectedValue(new Error('Preference for user 999 not found'));
      await expect(controller.getPreference('999')).rejects.toThrow();
    });
  });

  describe('updatePreference', () => {
    it('should update or create preference for current user', async () => {
      vi.spyOn(service, 'updatePreference').mockResolvedValue({ isDarkMode: true, isGridLayout: true } as any);
      const result = await controller.updatePreference(USER_ID, { isDarkMode: true } as any);
      expect(service.updatePreference).toHaveBeenCalledWith(USER_ID, { isDarkMode: true });
      expect(result).toEqual({ isDarkMode: true, isGridLayout: true });
    });
  });
});
