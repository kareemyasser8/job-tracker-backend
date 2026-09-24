import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Prisma } from '../../generated/prisma/client.js';
import {
  ApplicationStatus,
  Currency,
  EmploymentType,
  WorkMode,
} from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { applicationSelect } from './application.service.js';
import { ApplicationService } from './application.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { FindApplicationsQueryDto } from './dto/find-applications-query.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';

function makeRaw(overrides: Partial<any> = {}) {
  return {
    id: 'app-1',
    status: ApplicationStatus.APPLIED,
    position: 1000,
    title: 'Senior Backend Engineer',
    description: null,
    jobUrl: null,
    workMode: WorkMode.REMOTE,
    employmentType: EmploymentType.FULL_TIME,
    salaryMin: 60000,
    salaryMax: 90000,
    salaryCurrency: Currency.USD,
    appliedAt: new Date('2026-09-14T10:55:11.715Z'),
    createdAt: new Date('2026-09-14T12:00:00.000Z'),
    company: { name: 'Acme Inc.' },
    role: { name: 'Backend Engineer' },
    source: { name: 'LinkedIn' },
    technologies: [],
    notes: [],
    ...overrides,
  };
}

describe('ApplicationService', () => {
  let service: ApplicationService;

  const prismaService: any = {
    application: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    company: { findFirst: vi.fn() },
    role: { findFirst: vi.fn() },
    source: { findFirst: vi.fn() },
    technology: { findFirst: vi.fn() },
    applicationTechnology: { createMany: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    // Default: referenced entities are visible
    prismaService.company.findFirst.mockResolvedValue({ id: 'c1' });
    prismaService.role.findFirst.mockResolvedValue({ id: 'r1' });
    prismaService.source.findFirst.mockResolvedValue({ id: 's1' });
    prismaService.technology.findFirst.mockResolvedValue({ id: 't1' });
    // Default transaction behavior
    prismaService.$transaction.mockImplementation(async (cb: any) => {
      if (typeof cb === 'function') {
        const tx: any = {
          application: {
            update: vi.fn().mockResolvedValue({ id: 'app-1' }),
            findFirst: vi.fn().mockResolvedValue(makeRaw()),
          },
          applicationTechnology: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
        };
        return cb(tx);
      }
      return Promise.all(cb);
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createApplication', () => {
    it('should create an application without technologies', async () => {
      const createDto: CreateApplicationDto = {
        companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        title: 'Senior Backend Engineer',
        workMode: WorkMode.REMOTE,
        appliedAt: '2026-09-14T10:55:11.715Z',
      };

      const raw = makeRaw();
      prismaService.application.create.mockResolvedValue(raw);

      const result = await service.createApplication(createDto, USER_ID);

      expect(prismaService.application.create).toHaveBeenCalledWith({
        data: {
          companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
          roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
          sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
          title: 'Senior Backend Engineer',
          workMode: WorkMode.REMOTE,
          userId: USER_ID,
          appliedAt: new Date('2026-09-14T10:55:11.715Z'),
        },
        select: applicationSelect,
      });

      expect(result).toEqual({
        id: raw.id,
        status: raw.status,
        position: raw.position,
        title: raw.title,
        description: raw.description,
        jobUrl: raw.jobUrl,
        workMode: raw.workMode,
        employmentType: raw.employmentType,
        salaryMin: raw.salaryMin,
        salaryMax: raw.salaryMax,
        salaryCurrency: raw.salaryCurrency,
        appliedAt: raw.appliedAt,
        createdAt: raw.createdAt,
        company: 'Acme Inc.',
        role: 'Backend Engineer',
        source: 'LinkedIn',
        technologies: [],
        notes: [],
      });
    });

    it('should create with technologyIds after visibility check', async () => {
      const techId = 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b';
      const createDto: CreateApplicationDto = {
        companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        title: 'Senior Backend Engineer',
        workMode: WorkMode.REMOTE,
        appliedAt: '2026-09-14T10:55:11.715Z',
        technologyIds: [techId],
      };

      const raw = makeRaw({ technologies: [{ technology: { name: 'TypeScript' } }] });
      prismaService.application.create.mockResolvedValue(raw);

      const result = await service.createApplication(createDto, USER_ID);

      expect(result.technologies).toEqual(['TypeScript']);
      expect(prismaService.technology.findFirst).toHaveBeenCalledWith({
        where: { id: techId, OR: [{ ownerId: null }, { ownerId: USER_ID }] },
        select: { id: true },
      });
    });

    it('should throw NotFound if company not visible', async () => {
      prismaService.company.findFirst.mockResolvedValue(null);
      const dto: CreateApplicationDto = {
        companyId: 'bad-company',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        title: 'Test',
        workMode: WorkMode.REMOTE,
        appliedAt: '2026-09-14T10:55:11.715Z',
      };
      await expect(service.createApplication(dto, USER_ID)).rejects.toThrow(NotFoundException);
      await expect(service.createApplication(dto, USER_ID)).rejects.toThrow('Company with id bad-company not found');
    });

    it('should throw NotFound if technology not visible', async () => {
      prismaService.technology.findFirst.mockResolvedValue(null);
      const dto: CreateApplicationDto = {
        companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        title: 'Test',
        workMode: WorkMode.REMOTE,
        appliedAt: '2026-09-14T10:55:11.715Z',
        technologyIds: ['bad-tech'],
      };
      await expect(service.createApplication(dto, USER_ID)).rejects.toThrow('Technology with id bad-tech not found');
    });

    it('should deduplicate technologyIds', async () => {
      const techId = 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b';
      const otherId = 'c3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7c';
      const createDto: CreateApplicationDto = {
        companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        title: 'Senior Backend Engineer',
        workMode: WorkMode.REMOTE,
        appliedAt: '2026-09-14T10:55:11.715Z',
        technologyIds: [techId, techId, otherId],
      };
      const raw = makeRaw({ technologies: [{ technology: { name: 'NestJS' } }, { technology: { name: 'PostgreSQL' } }] });
      prismaService.application.create.mockResolvedValue(raw);
      await service.createApplication(createDto, USER_ID);
      const callData = prismaService.application.create.mock.calls[0][0].data;
      expect(callData.technologies.create).toHaveLength(2);
    });
  });

  describe('findAll', () => {
    it('should filter by userId and forward where to both queries', async () => {
      const query: FindApplicationsQueryDto = { page: 2, limit: 10 };
      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      const result = await service.findAll(query, USER_ID);

      expect(prismaService.application.findMany).toHaveBeenCalledWith({
        where: { userId: USER_ID },
        skip: 10,
        take: 10,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: applicationSelect,
      });
      expect(prismaService.application.count).toHaveBeenCalledWith({ where: { userId: USER_ID } });
      expect(result).toEqual({ total: 0, data: [] });
    });

    it('should include filters plus userId', async () => {
      const query: FindApplicationsQueryDto = {
        page: 1,
        limit: 10,
        status: [ApplicationStatus.APPLIED],
      };
      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      await service.findAll(query, USER_ID);

      const where = prismaService.application.findMany.mock.calls[0][0].where;
      expect(where.userId).toBe(USER_ID);
      expect(where.AND).toEqual([{ status: { in: [ApplicationStatus.APPLIED] } }]);
    });
  });

  describe('findOne', () => {
    it('should return application for owner', async () => {
      const raw = makeRaw({ id: 'app-1' });
      prismaService.application.findFirst.mockResolvedValue(raw);
      const result = await service.findOne('app-1', USER_ID);
      expect(prismaService.application.findFirst).toHaveBeenCalledWith({ where: { id: 'app-1', userId: USER_ID }, select: applicationSelect });
      expect(result.id).toBe('app-1');
    });

    it('should throw NotFound for other user (404)', async () => {
      prismaService.application.findFirst.mockResolvedValue(null);
      await expect(service.findOne('app-1', OTHER_USER_ID)).rejects.toThrow(new NotFoundException('Application with id app-1 not found'));
    });
  });

  describe('updateOne', () => {
    it('should update without touching technologies when not provided', async () => {
      prismaService.application.findFirst.mockResolvedValue({ id: 'app-1' });
      const raw = makeRaw({ title: 'Updated Title', status: ApplicationStatus.OFFER });
      prismaService.application.update.mockResolvedValue(raw);

      const result = await service.updateOne('app-1', { title: 'Updated Title', status: ApplicationStatus.OFFER } as UpdateApplicationDto, USER_ID);

      expect(prismaService.application.update).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: { title: 'Updated Title', status: ApplicationStatus.OFFER },
        select: applicationSelect,
      });
      expect(result.title).toBe('Updated Title');
    });

    it('should replace technologies inside transaction when provided', async () => {
      prismaService.application.findFirst.mockResolvedValue({ id: 'app-1' });
      const techId = 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b';
      const raw = makeRaw({ technologies: [{ technology: { name: 'TypeScript' } }] });

      prismaService.$transaction.mockImplementation(async (cb: any) => {
        const tx: any = {
          application: {
            update: vi.fn().mockResolvedValue({ id: 'app-1' }),
            findFirst: vi.fn().mockResolvedValue(raw),
          },
          applicationTechnology: { createMany: vi.fn().mockResolvedValue({ count: 1 }) },
        };
        const res = await cb(tx);
        expect(tx.application.update).toHaveBeenCalledWith({
          where: { id: 'app-1' },
          data: { title: 'Partial', technologies: { deleteMany: {} } },
          select: { id: true },
        });
        return res;
      });

      const result = await service.updateOne('app-1', { title: 'Partial', technologyIds: [techId] } as UpdateApplicationDto, USER_ID);
      expect(result.technologies).toEqual(['TypeScript']);
      expect(prismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw NotFound if application not owned', async () => {
      prismaService.application.findFirst.mockResolvedValue(null);
      await expect(service.updateOne('app-999', { title: 'x' } as UpdateApplicationDto, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFound if referenced company not visible on update', async () => {
      prismaService.application.findFirst.mockResolvedValue({ id: 'app-1' });
      prismaService.company.findFirst.mockResolvedValue(null);
      await expect(service.updateOne('app-1', { companyId: 'bad' } as UpdateApplicationDto, USER_ID)).rejects.toThrow('Company with id bad not found');
    });

    it('should throw NotFoundException on P2025', async () => {
      prismaService.application.findFirst.mockResolvedValue({ id: 'app-1' });
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', { code: 'P2025', clientVersion: '7.10.0' });
      prismaService.application.update.mockRejectedValue(error);
      await expect(service.updateOne('app-999', { title: 'x' } as UpdateApplicationDto, USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteOne', () => {
    it('should delete owned application', async () => {
      prismaService.application.findFirst.mockResolvedValue({ id: 'app-1' });
      prismaService.application.delete.mockResolvedValue({});
      await service.deleteOne('app-1', USER_ID);
      expect(prismaService.application.delete).toHaveBeenCalledWith({ where: { id: 'app-1' } });
    });

    it('should throw NotFound for other user', async () => {
      prismaService.application.findFirst.mockResolvedValue(null);
      await expect(service.deleteOne('app-1', OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException on P2025', async () => {
      prismaService.application.findFirst.mockResolvedValue({ id: 'app-1' });
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', { code: 'P2025', clientVersion: '7.10.0' });
      prismaService.application.delete.mockRejectedValue(error);
      await expect(service.deleteOne('app-999', USER_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
