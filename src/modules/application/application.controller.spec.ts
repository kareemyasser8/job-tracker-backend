import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { ApplicationResponse } from '../../common/entities/application-response.entity.js';
import {
  ApplicationStatus,
  Currency,
  EmploymentType,
  WorkMode,
} from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ApplicationController } from './application.controller.js';
import { ApplicationService } from './application.service.js';

const USER_ID = 'user-1';

const mockApplication: ApplicationResponse = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  status: ApplicationStatus.APPLIED,
  position: 1000,
  title: 'Senior Backend Engineer',
  description: 'Great opportunity',
  jobUrl: 'https://example.com/jobs/123',
  workMode: WorkMode.REMOTE,
  employmentType: EmploymentType.FULL_TIME,
  salaryMin: 60000,
  salaryMax: 90000,
  salaryCurrency: Currency.USD,
  appliedAt: new Date('2026-09-14T10:55:11.715Z'),
  createdAt: new Date('2026-09-14T12:00:00.000Z'),
  company: 'Acme Inc.',
  role: 'Backend Engineer',
  source: 'LinkedIn',
  technologies: ['NestJS', 'PostgreSQL'],
  notes: ['note content 1', 'note content 2'],
};

describe('ApplicationController', () => {
  let controller: ApplicationController;
  let service: ApplicationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationController],
      providers: [
        ApplicationService,
        {
          provide: PrismaService,
          useValue: {
            application: { create: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), delete: vi.fn(), count: vi.fn() },
            company: { findFirst: vi.fn() },
            role: { findFirst: vi.fn() },
            source: { findFirst: vi.fn() },
            technology: { findFirst: vi.fn() },
            $transaction: vi.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ApplicationController>(ApplicationController);
    service = module.get<ApplicationService>(ApplicationService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated applications', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({ total: 1, data: [mockApplication] });
      const result = await controller.findAll({ page: 1, limit: 10 } as any, USER_ID);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, USER_ID);
      expect(result).toEqual({ total: 1, data: [mockApplication] });
    });

    it('should forward query DTO to service with userId', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({ total: 1, data: [mockApplication] });
      const query = { page: 1, limit: 10, status: [ApplicationStatus.APPLIED], search: 'engineer' } as any;
      const result = await controller.findAll(query, USER_ID);
      expect(service.findAll).toHaveBeenCalledWith(query, USER_ID);
      expect(result).toEqual({ total: 1, data: [mockApplication] });
    });

    it('should return an empty page when there are no applications', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({ total: 0, data: [] });
      const result = await controller.findAll({ page: 1, limit: 10 } as any, USER_ID);
      expect(result).toEqual({ total: 0, data: [] });
    });
  });

  describe('getApplications (alias)', () => {
    it('should delegate to findAll', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({ total: 1, data: [mockApplication] });
      const result = await controller.getApplications({ page: 1, limit: 10 } as any, USER_ID);
      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 }, USER_ID);
      expect(result).toEqual({ total: 1, data: [mockApplication] });
    });
  });

  describe('getApplication', () => {
    it('should return an application by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockApplication);
      const result = await controller.getApplication(mockApplication.id, USER_ID);
      expect(service.findOne).toHaveBeenCalledWith(mockApplication.id, USER_ID);
      expect(result).toEqual(mockApplication);
    });

    it('should propagate NotFoundException', async () => {
      vi.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Application with id 999 not found'));
      await expect(controller.getApplication('999', USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createApplication', () => {
    it('should create an application and return it', async () => {
      const dto = {
        companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        title: 'Senior Backend Engineer',
        workMode: WorkMode.REMOTE,
        appliedAt: '2026-09-14T10:55:11.715Z',
      };
      vi.spyOn(service, 'createApplication').mockResolvedValue(mockApplication);
      const result = await controller.createApplication(dto as any, USER_ID);
      expect(service.createApplication).toHaveBeenCalledWith(dto, USER_ID);
      expect(result).toEqual(mockApplication);
    });
  });

  describe('updateApplication', () => {
    it('should update an application', async () => {
      const dto = { title: 'Staff Engineer' };
      const updated = { ...mockApplication, title: 'Staff Engineer' };
      vi.spyOn(service, 'updateOne').mockResolvedValue(updated);
      const result = await controller.updateApplication(mockApplication.id, dto as any, USER_ID);
      expect(service.updateOne).toHaveBeenCalledWith(mockApplication.id, dto, USER_ID);
      expect(result).toEqual(updated);
    });

    it('should propagate NotFoundException on update for missing id', async () => {
      vi.spyOn(service, 'updateOne').mockRejectedValue(new NotFoundException('Application with id 999 not found'));
      await expect(controller.updateApplication('999', { title: 'x' } as any, USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteApplication', () => {
    it('should delete an application', async () => {
      vi.spyOn(service, 'deleteOne').mockResolvedValue(undefined);
      const result = await controller.deleteApplication(mockApplication.id, USER_ID);
      expect(service.deleteOne).toHaveBeenCalledWith(mockApplication.id, USER_ID);
      expect(result).toBeUndefined();
    });

    it('should propagate NotFoundException on delete', async () => {
      vi.spyOn(service, 'deleteOne').mockRejectedValue(new NotFoundException('Application with id 999 not found'));
      await expect(controller.deleteApplication('999', USER_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
