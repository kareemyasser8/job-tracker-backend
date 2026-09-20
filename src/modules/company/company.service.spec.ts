import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { CompanyService } from './company.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

const COMPANY_CREATE_SELECT = {
  id: true,
  ownerId: true,
  name: true,
  normalizedName: true,
  domain: true,
  location: true,
  logoUrl: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

const COMPANY_SELECT = {
  id: true,
  name: true,
  normalizedName: true,
  domain: true,
  location: true,
  logoUrl: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

describe('CompanyService', () => {
  let service: CompanyService;

  const prismaService = {
    company: {
      create: vi.fn(),
      findMany: vi.fn(),
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
        CompanyService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createCompany', () => {
    it('should create a company', async () => {
      const dto = { name: 'Acme Inc.', normalizedName: 'acme-inc' };
      const createdCompany = {
        id: '1',
        ownerId: null,
        name: 'Acme Inc.',
        normalizedName: 'acme-inc',
        domain: null,
        location: null,
        logoUrl: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.company.create.mockResolvedValue(createdCompany as never);
      await service.createCompany(dto);
      expect(prismaService.company.create).toHaveBeenCalledWith({
        data: {
          name: 'Acme Inc.',
          normalizedName: 'acme-inc',
          domain: undefined,
          location: undefined,
          logoUrl: undefined,
          ownerId: undefined,
          isVerified: true,
        },
        select: COMPANY_CREATE_SELECT,
      });
    });

    it('should create a user-owned company as unverified', async () => {
      const dto = {
        name: 'Acme Inc.',
        normalizedName: 'acme-inc',
        ownerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      };
      const createdCompany = {
        id: '1',
        ownerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        name: 'Acme Inc.',
        normalizedName: 'acme-inc',
        domain: null,
        location: null,
        logoUrl: null,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.company.create.mockResolvedValue(createdCompany as never);
      await service.createCompany(dto);
      expect(prismaService.company.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ownerId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          isVerified: false,
        }),
        select: expect.objectContaining({ isVerified: true, ownerId: true }),
      });
    });
  });

  describe('findAll', () => {
    it('should return paginated companies', async () => {
      prismaService.company.findMany.mockResolvedValue([] as never);
      prismaService.company.count.mockResolvedValue(0 as never);
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(prismaService.company.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: COMPANY_SELECT,
      });
      expect(prismaService.company.count).toHaveBeenCalledWith();
      expect(result).toEqual({ total: 0, data: [] });
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException for missing company', async () => {
      prismaService.company.findUnique.mockResolvedValue(null as never);
      await expect(service.findOne('999')).rejects.toThrow('Company with id 999 not found');
    });

    it('should return a company', async () => {
      const company = {
        id: '1',
        name: 'Acme',
        normalizedName: 'acme',
        domain: null,
        location: null,
        logoUrl: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.company.findUnique.mockResolvedValue(company as never);
      const result = await service.findOne('1');
      expect(prismaService.company.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        select: COMPANY_SELECT,
      });
      expect(result.name).toBe('Acme');
    });
  });

  describe('updateCompany', () => {
    it('should update a company', async () => {
      const updatedCompany = {
        id: '1',
        name: 'Updated',
        normalizedName: 'updated',
        domain: null,
        location: null,
        logoUrl: null,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prismaService.company.update.mockResolvedValue(updatedCompany as never);
      await service.updateCompany('1', { name: 'Updated' });
      expect(prismaService.company.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          name: 'Updated',
          normalizedName: undefined,
          domain: undefined,
          location: undefined,
          logoUrl: undefined,
          isVerified: undefined,
        },
      });
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      prismaService.company.delete.mockResolvedValue({ id: '1' } as never);
      await service.remove('1');
      expect(prismaService.company.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});