import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Application } from '../../common/entities/application.entity.js';
import { Technology } from '../../common/entities/technology.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';

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
} as const;

type RawApplication = Omit<Application, 'technologies'> & {
  technologies: { technology: Technology }[];
};

function mapTechnologies(raw: RawApplication): Application {
  const { technologies: join, ...rest } = raw as unknown as RawApplication;
  return {
    ...(rest as unknown as Application),
    technologies: (join as { technology: Technology }[])?.map((j) => j.technology) ?? [],
  } as Application;
}

@Injectable()
export class ApplicationService {
  constructor(private readonly prismaService: PrismaService) {}

  async createApplication(createApplicationDto: CreateApplicationDto): Promise<Application> {
    const raw = (await this.prismaService.application.create({
      data: {
        userId: createApplicationDto.userId,
        companyId: createApplicationDto.companyId,
        roleId: createApplicationDto.roleId,
        sourceId: createApplicationDto.sourceId,
        status: createApplicationDto.status,
        position: createApplicationDto.position,
        title: createApplicationDto.title,
        description: createApplicationDto.description,
        jobUrl: createApplicationDto.jobUrl,
        workMode: createApplicationDto.workMode,
        employmentType: createApplicationDto.employmentType,
        salaryMin: createApplicationDto.salaryMin,
        salaryMax: createApplicationDto.salaryMax,
        salaryCurrency: createApplicationDto.salaryCurrency,
        appliedAt: new Date(createApplicationDto.appliedAt),
        ...(createApplicationDto.technologyIds?.length
          ? {
              technologies: {
                create: createApplicationDto.technologyIds.map((technologyId) => ({
                  technologyId,
                })),
              },
            }
          : {}),
      },
      select: {
        ...APPLICATION_SELECT,
        technologies: {
          select: {
            technology: { select: TECHNOLOGY_SELECT },
          },
        },
      },
    })) as unknown as RawApplication;

    return mapTechnologies(raw);
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ total: number; data: Application[] }> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [rawData, total] = await Promise.all([
      this.prismaService.application.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          ...APPLICATION_SELECT,
          technologies: {
            select: {
              technology: { select: TECHNOLOGY_SELECT },
            },
          },
        },
      }) as unknown as Promise<RawApplication[]>,
      this.prismaService.application.count(),
    ]);

    const data = rawData.map(mapTechnologies);

    return { total, data };
  }

  async findOne(id: string): Promise<Application> {
    const raw = (await this.prismaService.application.findUnique({
      where: { id },
      select: {
        ...APPLICATION_SELECT,
        technologies: {
          select: {
            technology: { select: TECHNOLOGY_SELECT },
          },
        },
      },
    })) as unknown as RawApplication | null;
    if (!raw) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    return mapTechnologies(raw);
  }

  async updateOne(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<Application> {
    const raw = (await this.prismaService.application.update({
      where: { id },
      data: {
        userId: updateApplicationDto?.userId,
        companyId: updateApplicationDto?.companyId,
        roleId: updateApplicationDto?.roleId,
        sourceId: updateApplicationDto?.sourceId,
        status: updateApplicationDto?.status,
        position: updateApplicationDto?.position,
        title: updateApplicationDto?.title,
        description: updateApplicationDto?.description,
        jobUrl: updateApplicationDto?.jobUrl,
        workMode: updateApplicationDto?.workMode,
        employmentType: updateApplicationDto?.employmentType,
        salaryMin: updateApplicationDto?.salaryMin,
        salaryMax: updateApplicationDto?.salaryMax,
        salaryCurrency: updateApplicationDto?.salaryCurrency,
        appliedAt: updateApplicationDto?.appliedAt
          ? new Date(updateApplicationDto.appliedAt)
          : undefined,
        ...(updateApplicationDto?.technologyIds !== undefined
          ? {
              technologies: {
                deleteMany: {},
                create: updateApplicationDto.technologyIds.map((technologyId) => ({
                  technologyId,
                })),
              },
            }
          : {}),
      },
      select: {
        ...APPLICATION_SELECT,
        technologies: {
          select: {
            technology: { select: TECHNOLOGY_SELECT },
          },
        },
      },
    })) as unknown as RawApplication;

    return mapTechnologies(raw);
  }

  async deleteOne(id: string): Promise<void> {
    await this.prismaService.application.delete({
      where: { id },
    });
  }
}
