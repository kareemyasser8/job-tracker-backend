import { Injectable, NotFoundException } from '@nestjs/common';
import {
  ApplicationInsightsSummary,
  ApplicationStatusCount,
  WeeklyApplicationCount,
} from '../../common/entities/application-insights-response.entity.js';
import { ApplicationResponse } from '../../common/entities/application-response.entity.js';
import { Prisma } from '../../generated/prisma/client.js';
import { ApplicationStatus } from '../../generated/prisma/enums.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { buildOrderBy, buildWhere } from './application-query.builder.js';
import { CreateApplicationDto } from './dto/create-application.dto.js';
import { FindApplicationsQueryDto } from './dto/find-applications-query.dto.js';
import { InsightsQueryDto } from './dto/insights-query.dto.js';
import { UpdateApplicationDto } from './dto/update-application.dto.js';
import { WeeklyInsightsQueryDto } from './dto/weekly-insights-query.dto.js';

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
  company: { select: { id: true, name: true } },
  role: { select: { id: true, name: true } },
  source: { select: { id: true, name: true } },
  technologies: {
    select: { technology: { select: { id: true, name: true } } },
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
    company: { id: raw.company.id, name: raw.company.name },
    role: { id: raw.role.id, name: raw.role.name },
    source: { id: raw.source.id, name: raw.source.name },
    technologies: raw.technologies.map((t) => ({
      id: t.technology.id,
      name: t.technology.name,
    })),
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

const INSIGHTS_STATUS_ORDER: ApplicationStatus[] = [
  ApplicationStatus.APPLIED,
  ApplicationStatus.PHONE_SCREEN,
  ApplicationStatus.INTERVIEWING,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
  ApplicationStatus.GHOSTED,
];

const EXCLUDED_INSIGHTS_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.WISHLIST,
  ApplicationStatus.ACCEPTED,
];

const RESPONSE_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.PHONE_SCREEN,
  ApplicationStatus.INTERVIEWING,
  ApplicationStatus.OFFER,
  ApplicationStatus.REJECTED,
];

const INTERVIEW_STATUSES: ApplicationStatus[] = [
  ApplicationStatus.INTERVIEWING,
  ApplicationStatus.OFFER,
];

const OFFER_STATUSES: ApplicationStatus[] = [ApplicationStatus.OFFER];

function buildInsightsWhere(
  userId: string,
  query: InsightsQueryDto,
): Prisma.ApplicationWhereInput {
  const where: Prisma.ApplicationWhereInput = {
    userId,
    status: { notIn: EXCLUDED_INSIGHTS_STATUSES },
  };

  if (query.from || query.to) {
    where.appliedAt = {
      ...(query.from ? { gte: new Date(query.from) } : {}),
      ...(query.to ? { lte: new Date(query.to) } : {}),
    };
  }

  return where;
}

function toPercentage(part: number, whole: number): number {
  if (whole === 0) return 0;
  return Math.round((part / whole) * 1000) / 10;
}

function startOfSundayWeekUtc(date: Date): Date {
  const weekStart = new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
  weekStart.setUTCDate(weekStart.getUTCDate() - weekStart.getUTCDay());
  return weekStart;
}

function addUtcDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getWeeklyWindow(query: WeeklyInsightsQueryDto): {
  fromWeekStart: Date;
  endExclusive: Date;
} {
  const weeks = query.weeks ?? 8;
  const toWeekStart = query.to
    ? startOfSundayWeekUtc(new Date(query.to))
    : startOfSundayWeekUtc(new Date());
  const fromWeekStart = query.from
    ? startOfSundayWeekUtc(new Date(query.from))
    : addUtcDays(toWeekStart, -(weeks - 1) * 7);

  return { fromWeekStart, endExclusive: addUtcDays(toWeekStart, 7) };
}

@Injectable()
export class ApplicationService {
  constructor(private readonly prismaService: PrismaService) {}

  private async assertReferencesVisible(
    userId: string,
    refs: {
      companyId?: string;
      roleId?: string;
      sourceId?: string;
      technologyIds?: string[];
    },
  ) {
    const checks: Promise<void>[] = [];

    if (refs.companyId) {
      checks.push(
        this.prismaService.company
          .findFirst({
            where: {
              id: refs.companyId,
              OR: [{ ownerId: null }, { ownerId: userId }],
            },
            select: { id: true },
          })
          .then((row) => {
            if (!row)
              throw new NotFoundException(
                `Company with id ${refs.companyId} not found`,
              );
          }),
      );
    }

    if (refs.roleId) {
      checks.push(
        this.prismaService.role
          .findFirst({
            where: {
              id: refs.roleId,
              OR: [{ ownerId: null }, { ownerId: userId }],
            },
            select: { id: true },
          })
          .then((row) => {
            if (!row)
              throw new NotFoundException(
                `Role with id ${refs.roleId} not found`,
              );
          }),
      );
    }

    if (refs.sourceId) {
      checks.push(
        this.prismaService.source
          .findFirst({
            where: {
              id: refs.sourceId,
              OR: [{ ownerId: null }, { ownerId: userId }],
            },
            select: { id: true },
          })
          .then((row) => {
            if (!row)
              throw new NotFoundException(
                `Source with id ${refs.sourceId} not found`,
              );
          }),
      );
    }

    if (refs.technologyIds && refs.technologyIds.length > 0) {
      const uniqueIds = [...new Set(refs.technologyIds)];
      for (const tid of uniqueIds) {
        checks.push(
          this.prismaService.technology
            .findFirst({
              where: {
                id: tid,
                OR: [{ ownerId: null }, { ownerId: userId }],
              },
              select: { id: true },
            })
            .then((row) => {
              if (!row)
                throw new NotFoundException(
                  `Technology with id ${tid} not found`,
                );
            }),
        );
      }
    }

    await Promise.all(checks);
  }

  async createApplication(
    createApplicationDto: CreateApplicationDto,
    userId: string,
  ): Promise<ApplicationResponse> {
    const { technologyIds, appliedAt, ...rest } = createApplicationDto;

    await this.assertReferencesVisible(userId, {
      companyId: rest.companyId,
      roleId: rest.roleId,
      sourceId: rest.sourceId,
      technologyIds,
    });

    const uniqueIds = technologyIds ? [...new Set(technologyIds)] : [];

    const raw = await this.prismaService.application.create({
      data: {
        ...rest,
        userId,
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
    userId: string,
  ): Promise<{ total: number; data: ApplicationResponse[] }> {
    const { page, limit } = query;
    const skip = (page - 1) * limit;

    const filters = buildWhere(query);
    const where: Prisma.ApplicationWhereInput = { userId, ...filters };

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

  private async getStatusCounts(
    query: InsightsQueryDto,
    userId: string,
  ): Promise<ApplicationStatusCount[]> {
    const groups = await this.prismaService.application.groupBy({
      by: ['status'],
      where: buildInsightsWhere(userId, query),
      _count: { _all: true },
    });

    const counts = new Map(
      groups.map((group) => [group.status, group._count._all]),
    );

    return INSIGHTS_STATUS_ORDER.map((status) => ({
      status,
      count: counts.get(status) ?? 0,
    }));
  }

  async getInsightsSummary(
    query: InsightsQueryDto,
    userId: string,
  ): Promise<ApplicationInsightsSummary> {
    const statusCounts = await this.getStatusCounts(query, userId);
    const countOf = (statuses: ApplicationStatus[]) =>
      statusCounts
        .filter((entry) => statuses.includes(entry.status))
        .reduce((total, entry) => total + entry.count, 0);

    const applications = statusCounts.reduce(
      (total, entry) => total + entry.count,
      0,
    );
    const responses = countOf(RESPONSE_STATUSES);
    const interviews = countOf(INTERVIEW_STATUSES);
    const offers = countOf(OFFER_STATUSES);

    return {
      applications,
      responses,
      interviews,
      offers,
      responseRate: toPercentage(responses, applications),
      interviewRate: toPercentage(interviews, applications),
    };
  }

  async getInsightsStatus(
    query: InsightsQueryDto,
    userId: string,
  ): Promise<ApplicationStatusCount[]> {
    const statusCounts = await this.getStatusCounts(query, userId);
    return statusCounts.filter((entry) => entry.count > 0);
  }

  async getWeeklyInsights(
    query: WeeklyInsightsQueryDto,
    userId: string,
  ): Promise<WeeklyApplicationCount[]> {
    const { fromWeekStart, endExclusive } = getWeeklyWindow(query);

    const rows = await this.prismaService.application.findMany({
      where: {
        userId,
        status: { notIn: EXCLUDED_INSIGHTS_STATUSES },
        appliedAt: { gte: fromWeekStart, lt: endExclusive },
      },
      select: { appliedAt: true },
    });

    const counts = new Map<string, number>();
    for (const row of rows) {
      const weekStart = startOfSundayWeekUtc(row.appliedAt)
        .toISOString()
        .slice(0, 10);
      counts.set(weekStart, (counts.get(weekStart) ?? 0) + 1);
    }

    const result: WeeklyApplicationCount[] = [];
    for (
      let weekStart = fromWeekStart;
      weekStart < endExclusive;
      weekStart = addUtcDays(weekStart, 7)
    ) {
      const key = weekStart.toISOString().slice(0, 10);
      result.push({ weekStart: key, count: counts.get(key) ?? 0 });
    }

    return result;
  }

  async findOne(id: string, userId: string): Promise<ApplicationResponse> {
    const raw = await this.prismaService.application.findFirst({
      where: { id, userId },
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
    userId: string,
  ): Promise<ApplicationResponse> {
    const existing = await this.prismaService.application.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    const { technologyIds, appliedAt, ...rest } = updateApplicationDto;

    await this.assertReferencesVisible(userId, {
      companyId: rest.companyId,
      roleId: rest.roleId,
      sourceId: rest.sourceId,
      technologyIds,
    });

    try {
      if (technologyIds !== undefined) {
        const uniqueIds = [...new Set(technologyIds)];
        const raw = await this.prismaService.$transaction(async (tx) => {
          await tx.application.update({
            where: { id },
            data: {
              ...rest,
              ...(appliedAt ? { appliedAt: new Date(appliedAt) } : {}),
              technologies: { deleteMany: {} },
            } as Prisma.ApplicationUncheckedUpdateInput,
            select: { id: true },
          });

          if (uniqueIds.length > 0) {
            await tx.applicationTechnology.createMany({
              data: uniqueIds.map((technologyId) => ({
                applicationId: id,
                technologyId,
              })),
            });
          }

          return tx.application.findFirst({
            where: { id, userId },
            select: applicationSelect,
          });
        });

        if (!raw)
          throw new NotFoundException(`Application with id ${id} not found`);
        return toResponse(raw as RawApplication);
      }

      const raw = await this.prismaService.application.update({
        where: { id },
        data: {
          ...rest,
          ...(appliedAt ? { appliedAt: new Date(appliedAt) } : {}),
        } as Prisma.ApplicationUncheckedUpdateInput,
        select: applicationSelect,
      });

      return toResponse(raw);
    } catch (error) {
      handleNotFound(error, id);
    }
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    const existing = await this.prismaService.application.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!existing) {
      throw new NotFoundException(`Application with id ${id} not found`);
    }

    try {
      await this.prismaService.application.delete({
        where: { id },
      });
    } catch (error) {
      handleNotFound(error, id);
    }
  }
}
