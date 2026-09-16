import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { Company } from '../../common/entities/company.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CompanyController } from './company.controller.js';
import { CompanyService } from './company.service.js';

// A single realistic fixture, reused so every test asserts against the
// same full shape the entity/Prisma select actually returns.
const mockCompany: Company = {
  id: '7073b39c-8e1d-4d40-86ac-d331a800c4ee',
  ownerId: null,
  name: 'Acme Inc.',
  normalizedName: 'acme-inc',
  domain: 'acme.com',
  location: 'San Francisco, CA',
  logoUrl: 'https://cdn.example.com/logos/acme.png',
  isVerified: false,
  createdAt: new Date('2026-09-14T10:55:11.715Z'),
  updatedAt: new Date('2026-09-15T09:12:03.201Z'),
};

describe('CompanyController', () => {
  let controller: CompanyController;
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
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

    controller = module.get<CompanyController>(CompanyController);
    service = module.get<CompanyService>(CompanyService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCompanies', () => {
    it('should return paginated companies', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({
        total: 1,
        data: [mockCompany],
      });

      const result = await controller.getCompanies({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual({ total: 1, data: [mockCompany] });
    });

    it('should return an empty page when there are no companies', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({ total: 0, data: [] });

      const result = await controller.getCompanies({ page: 1, limit: 10 });

      expect(result).toEqual({ total: 0, data: [] });
    });
  });

  describe('getCompany', () => {
    it('should return a company by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockCompany);

      const result = await controller.getCompany(mockCompany.id);

      expect(service.findOne).toHaveBeenCalledWith(mockCompany.id);
      expect(result).toEqual(mockCompany);
    });

    it('should propagate NotFoundException for a missing company', async () => {
      vi.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException('Company with id 999 not found'),
      );

      await expect(controller.getCompany('999')).rejects.toThrow(
        NotFoundException,
      );
      await expect(controller.getCompany('999')).rejects.toThrow(
        'Company with id 999 not found',
      );
    });
  });

  describe('createCompany', () => {
    it('should create a company and return it', async () => {
      const dto = {
        name: 'Acme Inc.',
        normalizedName: 'acme-inc',
        domain: 'acme.com',
        location: 'San Francisco, CA',
        logoUrl: 'https://cdn.example.com/logos/acme.png',
      };
      vi.spyOn(service, 'createCompany').mockResolvedValue(mockCompany);

      const result = await controller.createCompany(dto);

      expect(service.createCompany).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCompany);
    });
  });

  describe('updateCompany', () => {
    it('should update a company and return the updated record', async () => {
      const dto = { name: 'Acme Holdings' };
      const updated = { ...mockCompany, name: 'Acme Holdings' };
      vi.spyOn(service, 'updateCompany').mockResolvedValue(updated);

      const result = await controller.updateCompany(mockCompany.id, dto);

      expect(service.updateCompany).toHaveBeenCalledWith(mockCompany.id, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteCompany', () => {
    it('should call service.remove with the given id', async () => {
      vi.spyOn(service, 'remove').mockResolvedValue(undefined);

      const result = await controller.deleteCompany(mockCompany.id);

      expect(service.remove).toHaveBeenCalledWith(mockCompany.id);
      expect(result).toBeUndefined();
    });
  });
});
