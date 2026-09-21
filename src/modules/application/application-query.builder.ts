import { Prisma } from '../../generated/prisma/client.js';
import { FindApplicationsQueryDto } from './dto/find-applications-query.dto.js';

export function buildWhere(
  query: FindApplicationsQueryDto,
): Prisma.ApplicationWhereInput {
  const {
    status,
    workMode,
    employmentType,
    search,
    companyId,
    roleId,
    sourceId,
    technologyIds,
    technologyMatch = 'any',
    appliedFrom,
    appliedTo,
    minSalary,
    maxSalary,
    salaryCurrency,
    hasSalary,
    hasJobUrl,
    hasNotes,
  } = query;

  const AND: Prisma.ApplicationWhereInput[] = [];

  if (status?.length) {
    AND.push({ status: { in: status } });
  }

  if (workMode?.length) {
    AND.push({ workMode: { in: workMode } });
  }

  if (employmentType?.length) {
    AND.push({ employmentType: { in: employmentType } });
  }

  if (search) {
    AND.push({
      OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { company: { name: { contains: search, mode: 'insensitive' } } },
        { role: { name: { contains: search, mode: 'insensitive' } } },
      ],
    });
  }

  if (companyId?.length) {
    AND.push({ companyId: { in: companyId } });
  }

  if (roleId?.length) {
    AND.push({ roleId: { in: roleId } });
  }

  if (sourceId?.length) {
    AND.push({ sourceId: { in: sourceId } });
  }

  if (technologyIds?.length) {
    if (technologyMatch === 'all') {
      for (const tid of technologyIds) {
        AND.push({ technologies: { some: { technologyId: tid } } });
      }
    } else {
      AND.push({
        technologies: { some: { technologyId: { in: technologyIds } } },
      });
    }
  }

  if (appliedFrom) {
    AND.push({ appliedAt: { gte: new Date(appliedFrom) } });
  }

  if (appliedTo) {
    AND.push({ appliedAt: { lte: new Date(appliedTo) } });
  }

  if (minSalary !== undefined) {
    AND.push({ salaryMax: { gte: minSalary } });
  }

  if (maxSalary !== undefined) {
    AND.push({ salaryMin: { lte: maxSalary } });
  }

  if (salaryCurrency) {
    AND.push({ salaryCurrency });
  }

  if (hasSalary !== undefined) {
    if (hasSalary) {
      AND.push({
        OR: [{ salaryMin: { not: null } }, { salaryMax: { not: null } }],
      });
    } else {
      AND.push({ salaryMin: null, salaryMax: null });
    }
  }

  if (hasJobUrl !== undefined) {
    if (hasJobUrl) {
      AND.push({ jobUrl: { not: null } });
    } else {
      AND.push({ jobUrl: null });
    }
  }

  if (hasNotes !== undefined) {
    if (hasNotes) {
      AND.push({ notes: { some: {} } });
    } else {
      AND.push({ notes: { none: {} } });
    }
  }

  if (AND.length === 0) {
    return {};
  }

  return { AND };
}

export function buildOrderBy(
  query: FindApplicationsQueryDto,
): Prisma.ApplicationOrderByWithRelationInput[] {
  const sortBy = query.sortBy ?? 'createdAt';
  const order = query.order ?? 'desc';

  if (sortBy === 'salaryMin' || sortBy === 'salaryMax') {
    return [
      {
        [sortBy]: { sort: order, nulls: 'last' },
      } as Prisma.ApplicationOrderByWithRelationInput,
      { id: order },
    ];
  }

  return [
    { [sortBy]: order } as Prisma.ApplicationOrderByWithRelationInput,
    { id: order },
  ];
}
