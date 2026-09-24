import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { PreferenceService } from './preference.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('PreferenceService', () => {
  let service: PreferenceService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreferenceService,
        {
          provide: PrismaService,
          useValue: {
            preference: {
              findUnique: vi.fn(),
              upsert: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PreferenceService>(PreferenceService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing preference', async () => {
      vi.spyOn(prismaService.preference, 'findUnique').mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow('Preference for user 999 not found');
    });

    it('should return a preference', async () => {
      vi.spyOn(prismaService.preference, 'findUnique').mockResolvedValue({ isDarkMode: true, isGridLayout: false });
      const result = await service.findOne('1');
      expect(result.isDarkMode).toBe(true);
      expect(result).toEqual({ isDarkMode: true, isGridLayout: false });
      expect(prismaService.preference.findUnique).toHaveBeenCalledWith({
        where: { userId: '1' },
        select: { isDarkMode: true, isGridLayout: true },
      });
    });
  });

  describe('updatePreference', () => {
    it('should upsert a preference (create if not exists)', async () => {
      vi.spyOn(prismaService.preference, 'upsert').mockResolvedValue({ isDarkMode: true, isGridLayout: true });
      await service.updatePreference('1', { isDarkMode: true });
      expect(prismaService.preference.upsert).toHaveBeenCalledWith({
        where: { userId: '1' },
        create: { userId: '1', isDarkMode: true, isGridLayout: false },
        update: { isDarkMode: true, isGridLayout: undefined },
        select: { isDarkMode: true, isGridLayout: true },
      });
    });
  });
});