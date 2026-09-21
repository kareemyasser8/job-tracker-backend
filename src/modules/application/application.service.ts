import { Injectable, NotFoundException } from '@nestjs/common';
import { ApplicationResponse } from '../../common/entities/application-response.entity.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { buildOrderBy, buildWhere } from './application-query.builder.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { FindApplicationsQueryDto } from './dto/find-applications-query.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';

export const applicationSelect = {
  id: true,
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
  company: { select: { name: true } },
  role: { select: { name: true } },
  source: { select: { name: true } },
  technologies: {
    select: { technology: { select: { name: true } } },
    orderBy: { technology: { name: 'asc' } },
  },
  notes: {
    select: { content: true },
    orderBy: { createdAt: 'asc' },
  },
} as const satisfies Prisma.ApplicationSelect;

type RawApplication = Prisma.ApplicationGetPayload<{
  select: typeof applicationSelect;
}>;

export function toResponse(raw: RawApplication): ApplicationResponse {
  return {
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
    company: raw.company.name,
    role: raw.role.name,
    source: raw.source.name,
    technologies: raw.technologies.map((t) => t.technology.name),
    notes: raw.notes.map((n) => n.content),
  };
}

function handleNotFound(error: unknown, id: string): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2025'
  ) {
    throw new NotFoundException(`Application with id ${id} not found`);
  }
  throw error;
}

@Injectable()
export class ApplicationService {
  constructor(private readonly prismaService: PrismaService) {}

  async createApplication(
    createApplicationDto: CreateApplicationDto,
  ): Promise<ApplicationResponse> {
    const { technologyIds, appliedAt, ...rest } = createApplicationDto;
    const uniqueIds = technologyIds ? [...new Set(technologyIds)] : [];

    const raw = await this.prismaService.application.create({
      data: {
        ...rest,
        appliedAt: new Date(appliedAt),
        ...(uniqueIds.length
          ? {
              technologies: {
                create: uniqueIds.map((technologyId) => ({
                  technologyId,
                })),
              },
            }
          : {}),
      } as Prisma.ApplicationUncheckedCreateInput,
      select: applicationSelect,
    });

    return toResponse(raw);
  }

  async findAll(
    query: FindApplicationsQueryDto,
  ): Promise<{ total: number; data: ApplicationResponse[] }> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const where = buildWhere(query);
    const orderBy = buildOrderBy(query);

    const [rawData, total] = await Promise.all([
      this.prismaService.application.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: applicationSelect,
      }),
      this.prismaService.application.count({ where }),
    ]);

    const data = rawData.map(toResponse);

    return { total, data };
  }

  async findOne(id: string): Promise<ApplicationResponse> {
    const raw = await this.prismaService.application.findUnique({
      where: { id },
      select: applicationSelect,
    });
    if (!raw) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }
    return toResponse(raw);
  }

  async updateOne(
    id: string,
    updateApplicationDto: UpdateApplicationDto,
  ): Promise<ApplicationResponse> {
    const { technologyIds, appliedAt, ...rest } = updateApplicationDto;

    try {
      const raw = await this.prismaService.application.update({
        where: { id },
        data: {
          ...rest,
          ...(appliedAt ? { appliedAt: new Date(appliedAt) } : {}),
          ...(technologyIds !== undefined
            ? {
                technologies: {
                  deleteMany: {},
                  create: [...new Set(technologyIds)].map((technologyId) => ({
                    technologyId,
                  })),
                },
              }
            : {}),
        } as Prisma.ApplicationUncheckedUpdateInput,
        select: applicationSelect,
      });

      return toResponse(raw);
    } catch (error) {
      handleNotFound(error, id);
    }
  }

  async deleteOne(id: string): Promise<void> {
    try {
      await this.prismaService.application.delete({
        where: { id },
      });
    } catch (error) {
      handleNotFound(error, id);
    }
  }
}
