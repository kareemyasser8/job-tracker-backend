import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { CompanyService } from './company.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

describe('CompanyService', () => {
  let service: CompanyService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: PrismaService,
          useValue: {
            company: {
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

    service = module.get<CompanyService>(CompanyService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCompany', () => {
    it('should create a company', async () => {
      const dto = { name: 'Acme Inc.', normalizedName: 'acme-inc' };
      vi.spyOn(prismaService.company, 'create').mockResolvedValue({ id: '1', ...dto });
      await service.createCompany(dto);
      expect(prismaService.company.create).toHaveBeenCalledWith({
        data: { ...dto, isVerified: false },
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated companies', async () => {
      vi.spyOn(prismaService.company, 'findMany').mockResolvedValue([]);
      vi.spyOn(prismaService.company, 'count').mockResolvedValue(0);
      await service.findAll({ page: 1, limit: 10 });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing company', async () => {
      vi.spyOn(prismaService.company, 'findUnique').mockResolvedValue(null);
      await expect(service.findOne('999')).rejects.toThrow('Company with id 999 not found');
    });

    it('should return a company', async () => {
      vi.spyOn(prismaService.company, 'findUnique').mockResolvedValue({ id: '1', name: 'Acme' });
      const result = await service.findOne('1');
      expect(result.name).toBe('Acme');
    });
  });

  describe('updateCompany', () => {
    it('should update a company', async () => {
      vi.spyOn(prismaService.company, 'update').mockResolvedValue({ id: '1', name: 'Updated' });
      await service.updateCompany('1', { name: 'Updated' });
      expect(prismaService.company.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'Updated' },
      });
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      vi.spyOn(prismaService.company, 'delete').mockResolvedValue({ id: '1' });
      await service.remove('1');
      expect(prismaService.company.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});