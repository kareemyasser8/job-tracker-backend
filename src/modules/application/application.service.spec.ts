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

  const prismaService = {
    application: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
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
        userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        title: 'Senior Backend Engineer',
        workMode: WorkMode.REMOTE,
        appliedAt: '2026-09-14T10:55:11.715Z',
      };

      const raw = makeRaw();

      prismaService.application.create.mockResolvedValue(raw);

      const result = await service.createApplication(createDto);

      expect(prismaService.application.create).toHaveBeenCalledWith({
        data: {
          userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
          roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
          sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
          title: 'Senior Backend Engineer',
          workMode: WorkMode.REMOTE,
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
      expect(result).not.toHaveProperty('userId');
      expect(result).not.toHaveProperty('companyId');
      expect(result).not.toHaveProperty('roleId');
      expect(result).not.toHaveProperty('sourceId');
    });

    it('should create an application with technologyIds', async () => {
      const techId = 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b';
      const createDto: CreateApplicationDto = {
        userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        title: 'Senior Backend Engineer',
        workMode: WorkMode.REMOTE,
        appliedAt: '2026-09-14T10:55:11.715Z',
        technologyIds: [techId],
      };

      const raw = makeRaw({
        technologies: [{ technology: { name: 'TypeScript' } }],
        notes: [{ content: 'note 1' }],
      });

      prismaService.application.create.mockResolvedValue(raw);

      const result = await service.createApplication(createDto);

      expect(prismaService.application.create).toHaveBeenCalledWith({
        data: {
          userId: createDto.userId,
          companyId: createDto.companyId,
          roleId: createDto.roleId,
          sourceId: createDto.sourceId,
          title: 'Senior Backend Engineer',
          workMode: WorkMode.REMOTE,
          appliedAt: new Date('2026-09-14T10:55:11.715Z'),
          technologies: {
            create: [{ technologyId: techId }],
          },
        },
        select: applicationSelect,
      });

      expect(result.technologies).toEqual(['TypeScript']);
      expect(result.notes).toEqual(['note 1']);
      expect(result.company).toBe('Acme Inc.');
      expect(result).not.toHaveProperty('userId');
    });

    it('should deduplicate technologyIds before writing', async () => {
      const techId = 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b';
      const otherId = 'c3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7c';
      const createDto: CreateApplicationDto = {
        userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        title: 'Senior Backend Engineer',
        workMode: WorkMode.REMOTE,
        appliedAt: '2026-09-14T10:55:11.715Z',
        technologyIds: [techId, techId, otherId, techId],
      };

      const raw = makeRaw({
        technologies: [
          { technology: { name: 'NestJS' } },
          { technology: { name: 'PostgreSQL' } },
        ],
      });

      prismaService.application.create.mockResolvedValue(raw);

      await service.createApplication(createDto);

      expect(prismaService.application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            technologies: {
              create: expect.arrayContaining([
                { technologyId: techId },
                { technologyId: otherId },
              ]),
            },
          }),
        }),
      );
      const callData = prismaService.application.create.mock.calls[0][0].data;
      expect(callData.technologies.create).toHaveLength(2);
    });

    it('should return empty arrays when technologies and notes are empty', async () => {
      const createDto: CreateApplicationDto = {
        userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        title: 'Senior Backend Engineer',
        workMode: WorkMode.REMOTE,
        appliedAt: '2026-09-14T10:55:11.715Z',
      };

      const raw = makeRaw({ technologies: [], notes: [] });
      prismaService.application.create.mockResolvedValue(raw);

      const result = await service.createApplication(createDto);

      expect(result.technologies).toEqual([]);
      expect(result.notes).toEqual([]);
    });
  });

  describe('findAll', () => {
    it('should return paginated applications with flattened shape', async () => {
      const query: FindApplicationsQueryDto = {
        page: 2,
        limit: 10,
      };

      const rawApplications = [
        makeRaw({
          id: 'app-1',
          title: 'Backend Engineer',
          company: { name: 'Acme' },
          role: { name: 'Backend' },
          source: { name: 'LinkedIn' },
          status: ApplicationStatus.APPLIED,
          workMode: WorkMode.REMOTE,
          technologies: [
            { technology: { name: 'NestJS' } },
            { technology: { name: 'PostgreSQL' } },
          ],
          notes: [{ content: 'note 1' }, { content: 'note 2' }],
        }),
        makeRaw({
          id: 'app-2',
          title: 'Frontend Engineer',
          status: ApplicationStatus.INTERVIEWING,
          workMode: WorkMode.HYBRID,
          technologies: [],
          notes: [],
        }),
      ];

      prismaService.application.findMany.mockResolvedValue(rawApplications);
      prismaService.application.count.mockResolvedValue(25);

      const result = await service.findAll(query);

      expect(prismaService.application.findMany).toHaveBeenCalledWith({
        where: {},
        skip: 10,
        take: 10,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: applicationSelect,
      });

      expect(prismaService.application.count).toHaveBeenCalledWith({
        where: {},
      });

      expect(result).toEqual({
        total: 25,
        data: [
          {
            id: 'app-1',
            status: ApplicationStatus.APPLIED,
            position: 1000,
            title: 'Backend Engineer',
            description: null,
            jobUrl: null,
            workMode: WorkMode.REMOTE,
            employmentType: EmploymentType.FULL_TIME,
            salaryMin: 60000,
            salaryMax: 90000,
            salaryCurrency: Currency.USD,
            appliedAt: rawApplications[0].appliedAt,
            createdAt: rawApplications[0].createdAt,
            company: 'Acme',
            role: 'Backend',
            source: 'LinkedIn',
            technologies: ['NestJS', 'PostgreSQL'],
            notes: ['note 1', 'note 2'],
          },
          {
            id: 'app-2',
            status: ApplicationStatus.INTERVIEWING,
            position: 1000,
            title: 'Frontend Engineer',
            description: null,
            jobUrl: null,
            workMode: WorkMode.HYBRID,
            employmentType: EmploymentType.FULL_TIME,
            salaryMin: 60000,
            salaryMax: 90000,
            salaryCurrency: Currency.USD,
            appliedAt: rawApplications[1].appliedAt,
            createdAt: rawApplications[1].createdAt,
            company: 'Acme Inc.',
            role: 'Backend Engineer',
            source: 'LinkedIn',
            technologies: [],
            notes: [],
          },
        ],
      });

      for (const item of result.data) {
        expect(item).not.toHaveProperty('userId');
        expect(item).not.toHaveProperty('companyId');
        expect(item).not.toHaveProperty('roleId');
        expect(item).not.toHaveProperty('sourceId');
      }
    });

    it('should calculate skip correctly for the first page', async () => {
      const query: FindApplicationsQueryDto = {
        page: 1,
        limit: 20,
      };

      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(prismaService.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          skip: 0,
          take: 20,
        }),
      );
    });

    it('should handle pagination with empty results', async () => {
      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({ total: 0, data: [] });
    });

    it('should filter by status when provided', async () => {
      const query: FindApplicationsQueryDto = {
        page: 1,
        limit: 10,
        status: [ApplicationStatus.APPLIED, ApplicationStatus.OFFER],
      };

      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      await service.findAll(query);

      const expectedWhere = {
        AND: [
          {
            status: {
              in: [ApplicationStatus.APPLIED, ApplicationStatus.OFFER],
            },
          },
        ],
      };

      expect(prismaService.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expectedWhere,
        }),
      );
      expect(prismaService.application.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });

    it('should filter by search when provided', async () => {
      const query: FindApplicationsQueryDto = {
        page: 1,
        limit: 10,
        search: 'engineer',
      };

      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      await service.findAll(query);

      const expectedWhere = {
        AND: [
          {
            OR: [
              { title: { contains: 'engineer', mode: 'insensitive' } },
              { description: { contains: 'engineer', mode: 'insensitive' } },
              {
                company: {
                  name: { contains: 'engineer', mode: 'insensitive' },
                },
              },
              { role: { name: { contains: 'engineer', mode: 'insensitive' } } },
            ],
          },
        ],
      };

      expect(prismaService.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expectedWhere }),
      );
      expect(prismaService.application.count).toHaveBeenCalledWith({
        where: expectedWhere,
      });
    });

    it('should combine status and search filters', async () => {
      const query: FindApplicationsQueryDto = {
        page: 1,
        limit: 10,
        status: [ApplicationStatus.WISHLIST],
        search: 'acme',
      };

      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      await service.findAll(query);

      expect(prismaService.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            AND: [
              { status: { in: [ApplicationStatus.WISHLIST] } },
              {
                OR: [
                  { title: { contains: 'acme', mode: 'insensitive' } },
                  { description: { contains: 'acme', mode: 'insensitive' } },
                  {
                    company: {
                      name: { contains: 'acme', mode: 'insensitive' },
                    },
                  },
                  { role: { name: { contains: 'acme', mode: 'insensitive' } } },
                ],
              },
            ],
          },
        }),
      );
    });

    it('should pass identical where to findMany and count and apply orderBy from builders', async () => {
      const query: FindApplicationsQueryDto = {
        page: 1,
        limit: 10,
        status: [ApplicationStatus.APPLIED],
        workMode: [WorkMode.REMOTE],
        search: 'test',
        sortBy: 'salaryMin',
        order: 'asc',
      } as FindApplicationsQueryDto;

      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      await service.findAll(query);

      const findManyCall = prismaService.application.findMany.mock.calls[0][0];
      const countCall = prismaService.application.count.mock.calls[0][0];

      expect(findManyCall.where).toEqual(countCall.where);
      expect(findManyCall.skip).toBe(0);
      expect(findManyCall.take).toBe(10);
      expect(findManyCall.orderBy).toEqual([
        { salaryMin: { sort: 'asc', nulls: 'last' } },
        { id: 'asc' },
      ]);
      expect(findManyCall.select).toEqual(applicationSelect);
    });

    it('should handle technologyIds any vs all, date range, salary overlap and presence flags', async () => {
      const techId1 = 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b';
      const techId2 = 'c3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7c';
      const queryAny: FindApplicationsQueryDto = {
        page: 1,
        limit: 10,
        technologyIds: [techId1, techId2],
        technologyMatch: 'any',
        appliedFrom: '2026-01-01T00:00:00.000Z',
        appliedTo: '2026-01-31T00:00:00.000Z',
        minSalary: 60000,
        maxSalary: 90000,
        salaryCurrency: Currency.USD,
        hasNotes: true,
        hasSalary: false,
        hasJobUrl: true,
      } as FindApplicationsQueryDto;

      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      await service.findAll(queryAny);

      const whereAny =
        prismaService.application.findMany.mock.calls[0][0].where;
      expect(whereAny.AND).toEqual(
        expect.arrayContaining([
          {
            technologies: {
              some: { technologyId: { in: [techId1, techId2] } },
            },
          },
          { appliedAt: { gte: new Date('2026-01-01T00:00:00.000Z') } },
          { appliedAt: { lte: new Date('2026-01-31T00:00:00.000Z') } },
          { salaryMax: { gte: 60000 } },
          { salaryMin: { lte: 90000 } },
          { salaryCurrency: Currency.USD },
          { notes: { some: {} } },
          { salaryMin: null, salaryMax: null },
          { jobUrl: { not: null } },
        ]),
      );

      vi.clearAllMocks();

      const queryAll: FindApplicationsQueryDto = {
        page: 1,
        limit: 10,
        technologyIds: [techId1, techId2],
        technologyMatch: 'all',
      } as FindApplicationsQueryDto;

      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      await service.findAll(queryAll);

      const whereAll =
        prismaService.application.findMany.mock.calls[0][0].where;
      expect(whereAll.AND).toEqual(
        expect.arrayContaining([
          { technologies: { some: { technologyId: techId1 } } },
          { technologies: { some: { technologyId: techId2 } } },
        ]),
      );
    });
  });

  describe('findOne', () => {
    it('should return an application by id with flattened shape', async () => {
      const raw = makeRaw({
        id: 'app-1',
        technologies: [{ technology: { name: 'React' } }],
        notes: [{ content: 'first note' }],
      });

      prismaService.application.findUnique.mockResolvedValue(raw);

      const result = await service.findOne('app-1');

      expect(prismaService.application.findUnique).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        select: applicationSelect,
      });

      expect(result).toEqual({
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
        appliedAt: raw.appliedAt,
        createdAt: raw.createdAt,
        company: 'Acme Inc.',
        role: 'Backend Engineer',
        source: 'LinkedIn',
        technologies: ['React'],
        notes: ['first note'],
      });
      expect(result).not.toHaveProperty('userId');
      expect(result.description).toBeNull();
      expect(
        result.description === null || typeof result.description === 'string',
      ).toBe(true);
    });

    it('should throw NotFoundException when application does not exist', async () => {
      prismaService.application.findUnique.mockResolvedValue(null);

      await expect(service.findOne('app-999')).rejects.toThrow(
        new NotFoundException('Application with id app-999 not found'),
      );
    });

    it('should return empty arrays when technologies and notes are empty', async () => {
      const raw = makeRaw({ technologies: [], notes: [] });
      prismaService.application.findUnique.mockResolvedValue(raw);

      const result = await service.findOne('app-1');

      expect(result.technologies).toEqual([]);
      expect(result.notes).toEqual([]);
    });
  });

  describe('updateOne', () => {
    it('should update an application without touching technologies when not provided', async () => {
      const updateDto: UpdateApplicationDto = {
        title: 'Updated Title',
        status: ApplicationStatus.OFFER,
      };

      const raw = makeRaw({
        title: 'Updated Title',
        status: ApplicationStatus.OFFER,
        technologies: [],
        notes: [],
      });

      prismaService.application.update.mockResolvedValue(raw);

      const result = await service.updateOne('app-1', updateDto);

      expect(prismaService.application.update).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: {
          title: 'Updated Title',
          status: ApplicationStatus.OFFER,
        },
        select: applicationSelect,
      });

      expect(result.title).toBe('Updated Title');
      expect(result.technologies).toEqual([]);
      expect(result).not.toHaveProperty('userId');
    });

    it('should replace technologies when technologyIds provided', async () => {
      const techId = 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b';
      const updateDto: UpdateApplicationDto = {
        title: 'Partial',
        technologyIds: [techId],
      };

      const raw = makeRaw({
        title: 'Partial',
        technologies: [{ technology: { name: 'TypeScript' } }],
      });

      prismaService.application.update.mockResolvedValue(raw);

      const result = await service.updateOne('app-1', updateDto);

      expect(prismaService.application.update).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: {
          title: 'Partial',
          technologies: {
            deleteMany: {},
            create: [{ technologyId: techId }],
          },
        },
        select: applicationSelect,
      });

      expect(result.technologies).toEqual(['TypeScript']);
    });

    it('should deduplicate technologyIds on update', async () => {
      const techId = 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b';
      const updateDto: UpdateApplicationDto = {
        technologyIds: [techId, techId, techId],
      };

      const raw = makeRaw({
        technologies: [{ technology: { name: 'TypeScript' } }],
      });

      prismaService.application.update.mockResolvedValue(raw);

      await service.updateOne('app-1', updateDto);

      const callData = prismaService.application.update.mock.calls[0][0].data;
      expect(callData.technologies.create).toHaveLength(1);
      expect(callData.technologies.create).toEqual([{ technologyId: techId }]);
    });

    it('should throw NotFoundException on P2025', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '7.10.0',
        },
      );
      prismaService.application.update.mockRejectedValue(error);

      await expect(
        service.updateOne('app-999', { title: 'x' }),
      ).rejects.toThrow(
        new NotFoundException('Application with id app-999 not found'),
      );
    });
  });

  describe('deleteOne', () => {
    it('should delete an application', async () => {
      prismaService.application.delete.mockResolvedValue({});

      await service.deleteOne('app-1');

      expect(prismaService.application.delete).toHaveBeenCalledWith({
        where: { id: 'app-1' },
      });
    });

    it('should throw NotFoundException on P2025', async () => {
      const error = new Prisma.PrismaClientKnownRequestError(
        'Record not found',
        {
          code: 'P2025',
          clientVersion: '7.10.0',
        },
      );
      prismaService.application.delete.mockRejectedValue(error);

      await expect(service.deleteOne('app-999')).rejects.toThrow(
        new NotFoundException('Application with id app-999 not found'),
      );
    });
  });
});
