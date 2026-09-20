import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';
import { ApplicationService } from './application.service.js';
import { WorkMode, ApplicationStatusType } from '../../generated/prisma/enums.js';

const TECHNOLOGY_SELECT = {
  id: true,
  ownerId: true,
  name: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} as const;

const APPLICATION_SELECT = {
  id: true,
  userId: true,
  companyId: true,
  roleId: true,
  sourceId: true,
  status: true,
  position: true,
  title: true,
  description: true,
  jobUrl: true,
  workMode: true,
  employmentType: true,
  salaryMin: true,
  salaryMax: true,
  salaryCurrency: true,
  appliedAt: true,
  createdAt: true,
  technologies: {
    select: {
      technology: { select: TECHNOLOGY_SELECT },
    },
  },
} as const;

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

      const raw = {
        id: 'app-1',
        userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
        roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
        sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
        status: ApplicationStatusType.APPLIED,
        position: 1000,
        title: 'Senior Backend Engineer',
        description: null,
        jobUrl: null,
        workMode: WorkMode.REMOTE,
        employmentType: null,
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: null,
        appliedAt: new Date('2026-09-14T10:55:11.715Z'),
        createdAt: new Date(),
        technologies: [],
      };

      prismaService.application.create.mockResolvedValue(raw);

      const result = await service.createApplication(createDto);

      expect(prismaService.application.create).toHaveBeenCalledWith({
        data: {
          userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          companyId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
          roleId: '5fa85f64-5717-4562-b3fc-2c963f66afa8',
          sourceId: '6fa85f64-5717-4562-b3fc-2c963f66afa9',
          status: undefined,
          position: undefined,
          title: 'Senior Backend Engineer',
          description: undefined,
          jobUrl: undefined,
          workMode: WorkMode.REMOTE,
          employmentType: undefined,
          salaryMin: undefined,
          salaryMax: undefined,
          salaryCurrency: undefined,
          appliedAt: new Date('2026-09-14T10:55:11.715Z'),
        },
        select: APPLICATION_SELECT,
      });

      expect(result).toEqual({ ...raw, technologies: [] });
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

      const tech = {
        id: techId,
        ownerId: null,
        name: 'TypeScript',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const raw = {
        id: 'app-1',
        userId: createDto.userId,
        companyId: createDto.companyId,
        roleId: createDto.roleId,
        sourceId: createDto.sourceId,
        status: ApplicationStatusType.APPLIED,
        position: 1000,
        title: 'Senior Backend Engineer',
        description: null,
        jobUrl: null,
        workMode: WorkMode.REMOTE,
        employmentType: null,
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: null,
        appliedAt: new Date('2026-09-14T10:55:11.715Z'),
        createdAt: new Date(),
        technologies: [{ technology: tech }],
      };

      prismaService.application.create.mockResolvedValue(raw);

      const result = await service.createApplication(createDto);

      expect(prismaService.application.create).toHaveBeenCalledWith({
        data: {
          userId: createDto.userId,
          companyId: createDto.companyId,
          roleId: createDto.roleId,
          sourceId: createDto.sourceId,
          status: undefined,
          position: undefined,
          title: 'Senior Backend Engineer',
          description: undefined,
          jobUrl: undefined,
          workMode: WorkMode.REMOTE,
          employmentType: undefined,
          salaryMin: undefined,
          salaryMax: undefined,
          salaryCurrency: undefined,
          appliedAt: new Date('2026-09-14T10:55:11.715Z'),
          technologies: {
            create: [{ technologyId: techId }],
          },
        },
        select: APPLICATION_SELECT,
      });

      expect(result).toEqual({ ...raw, technologies: [tech] });
    });
  });

  describe('findAll', () => {
    it('should return paginated applications with mapped technologies', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 2,
        limit: 10,
      };

      const tech = {
        id: 'tech-1',
        ownerId: null,
        name: 'Node.js',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const rawApplications = [
        {
          id: 'app-1',
          userId: 'user-1',
          companyId: 'company-1',
          roleId: 'role-1',
          sourceId: 'source-1',
          status: ApplicationStatusType.APPLIED,
          position: 1000,
          title: 'Backend Engineer',
          workMode: WorkMode.REMOTE,
          appliedAt: new Date(),
          createdAt: new Date(),
          technologies: [{ technology: tech }],
        },
        {
          id: 'app-2',
          userId: 'user-1',
          companyId: 'company-1',
          roleId: 'role-1',
          sourceId: 'source-1',
          status: ApplicationStatusType.INTERVIEWING,
          position: 1000,
          title: 'Frontend Engineer',
          workMode: WorkMode.HYBRID,
          appliedAt: new Date(),
          createdAt: new Date(),
          technologies: [],
        },
      ];

      prismaService.application.findMany.mockResolvedValue(rawApplications);
      prismaService.application.count.mockResolvedValue(25);

      const result = await service.findAll(paginationQuery);

      expect(prismaService.application.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: APPLICATION_SELECT,
      });

      expect(prismaService.application.count).toHaveBeenCalledWith();

      expect(result).toEqual({
        total: 25,
        data: [
          { ...rawApplications[0], technologies: [tech] },
          { ...rawApplications[1], technologies: [] },
        ],
      });
    });

    it('should calculate skip correctly for the first page', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 1,
        limit: 20,
      };

      prismaService.application.findMany.mockResolvedValue([]);
      prismaService.application.count.mockResolvedValue(0);

      await service.findAll(paginationQuery);

      expect(prismaService.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an application by id with mapped technologies', async () => {
      const tech = {
        id: 'tech-1',
        ownerId: null,
        name: 'React',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const raw = {
        id: 'app-1',
        userId: 'user-1',
        companyId: 'company-1',
        roleId: 'role-1',
        sourceId: 'source-1',
        status: ApplicationStatusType.APPLIED,
        position: 1000,
        title: 'Backend Engineer',
        workMode: WorkMode.REMOTE,
        appliedAt: new Date(),
        createdAt: new Date(),
        technologies: [{ technology: tech }],
      };

      prismaService.application.findUnique.mockResolvedValue(raw);

      const result = await service.findOne('app-1');

      expect(prismaService.application.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'app-1',
        },
        select: APPLICATION_SELECT,
      });

      expect(result).toEqual({ ...raw, technologies: [tech] });
    });

    it('should throw NotFoundException when application does not exist', async () => {
      prismaService.application.findUnique.mockResolvedValue(null);

      await expect(service.findOne('app-999')).rejects.toThrow(
        new NotFoundException('Application with id app-999 not found'),
      );
    });
  });

  describe('updateOne', () => {
    it('should update an application without touching technologies when not provided', async () => {
      const updateDto: UpdateApplicationDto = {
        title: 'Updated Title',
        status: ApplicationStatusType.OFFER,
      };

      const raw = {
        id: 'app-1',
        userId: 'user-1',
        companyId: 'company-1',
        roleId: 'role-1',
        sourceId: 'source-1',
        status: ApplicationStatusType.OFFER,
        position: 1000,
        title: 'Updated Title',
        workMode: WorkMode.REMOTE,
        appliedAt: new Date(),
        createdAt: new Date(),
        technologies: [],
      };

      prismaService.application.update.mockResolvedValue(raw);

      const result = await service.updateOne('app-1', updateDto);

      expect(prismaService.application.update).toHaveBeenCalledWith({
        where: { id: 'app-1' },
        data: {
          userId: undefined,
          companyId: undefined,
          roleId: undefined,
          sourceId: undefined,
          status: ApplicationStatusType.OFFER,
          position: undefined,
          title: 'Updated Title',
          description: undefined,
          jobUrl: undefined,
          workMode: undefined,
          employmentType: undefined,
          salaryMin: undefined,
          salaryMax: undefined,
          salaryCurrency: undefined,
          appliedAt: undefined,
        },
        select: APPLICATION_SELECT,
      });

      expect(result).toEqual({ ...raw, technologies: [] });
    });

    it('should replace technologies when technologyIds provided', async () => {
      const techId = 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b';
      const updateDto: UpdateApplicationDto = {
        title: 'Partial',
        technologyIds: [techId],
      };

      const tech = {
        id: techId,
        ownerId: null,
        name: 'TypeScript',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const raw = {
        id: 'app-1',
        title: 'Partial',
        status: ApplicationStatusType.APPLIED,
        workMode: WorkMode.REMOTE,
        createdAt: new Date(),
        technologies: [{ technology: tech }],
      };

      prismaService.application.update.mockResolvedValue(raw);

      const result = await service.updateOne('app-1', updateDto);

      expect(prismaService.application.update).toHaveBeenCalledWith({
        where: {
          id: 'app-1',
        },
        data: {
          userId: undefined,
          companyId: undefined,
          roleId: undefined,
          sourceId: undefined,
          status: undefined,
          position: undefined,
          title: 'Partial',
          description: undefined,
          jobUrl: undefined,
          workMode: undefined,
          employmentType: undefined,
          salaryMin: undefined,
          salaryMax: undefined,
          salaryCurrency: undefined,
          appliedAt: undefined,
          technologies: {
            deleteMany: {},
            create: [{ technologyId: techId }],
          },
        },
        select: APPLICATION_SELECT,
      });

      expect(result).toEqual({ ...raw, technologies: [tech] });
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
  });
});
