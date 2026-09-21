import {
  ApplicationStatus,
  Currency,
  EmploymentType,
  WorkMode,
} from '../../generated/prisma/enums.js';
import { buildOrderBy, buildWhere } from './application-query.builder.js';
import { FindApplicationsQueryDto } from './dto/find-applications-query.dto.js';

describe('buildWhere', () => {
  it('should return {} for empty query', () => {
    const query = { page: 1, limit: 10 } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({});
  });

  it('should filter by status', () => {
    const query = {
      page: 1,
      limit: 10,
      status: [ApplicationStatus.APPLIED],
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ status: { in: [ApplicationStatus.APPLIED] } }],
    });
  });

  it('should filter by workMode', () => {
    const query = {
      page: 1,
      limit: 10,
      workMode: [WorkMode.REMOTE, WorkMode.HYBRID],
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ workMode: { in: [WorkMode.REMOTE, WorkMode.HYBRID] } }],
    });
  });

  it('should filter by employmentType', () => {
    const query = {
      page: 1,
      limit: 10,
      employmentType: [EmploymentType.FULL_TIME],
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ employmentType: { in: [EmploymentType.FULL_TIME] } }],
    });
  });

  it('should filter by search (OR across title, description, company.name, role.name)', () => {
    const query = {
      page: 1,
      limit: 10,
      search: 'engineer',
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [
        {
          OR: [
            { title: { contains: 'engineer', mode: 'insensitive' } },
            { description: { contains: 'engineer', mode: 'insensitive' } },
            {
              company: { name: { contains: 'engineer', mode: 'insensitive' } },
            },
            { role: { name: { contains: 'engineer', mode: 'insensitive' } } },
          ],
        },
      ],
    });
  });

  it('should combine status and search under AND', () => {
    const query = {
      page: 1,
      limit: 10,
      status: [ApplicationStatus.WISHLIST],
      search: 'acme',
    } as FindApplicationsQueryDto;
    const where = buildWhere(query);
    expect(where).toEqual({
      AND: [
        { status: { in: [ApplicationStatus.WISHLIST] } },
        {
          OR: [
            { title: { contains: 'acme', mode: 'insensitive' } },
            { description: { contains: 'acme', mode: 'insensitive' } },
            { company: { name: { contains: 'acme', mode: 'insensitive' } } },
            { role: { name: { contains: 'acme', mode: 'insensitive' } } },
          ],
        },
      ],
    });
  });

  it('should filter by companyId', () => {
    const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const query = {
      page: 1,
      limit: 10,
      companyId: [id],
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ companyId: { in: [id] } }],
    });
  });

  it('should filter by roleId', () => {
    const id = '3fa85f64-5717-4562-b3fc-2c963f66afa7';
    const query = {
      page: 1,
      limit: 10,
      roleId: [id],
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ roleId: { in: [id] } }],
    });
  });

  it('should filter by sourceId', () => {
    const id = '3fa85f64-5717-4562-b3fc-2c963f66afa8';
    const query = {
      page: 1,
      limit: 10,
      sourceId: [id],
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ sourceId: { in: [id] } }],
    });
  });

  it('should filter by technologyIds with any (default)', () => {
    const ids = [
      'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b',
      'c3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7c',
    ];
    const query = {
      page: 1,
      limit: 10,
      technologyIds: ids,
      technologyMatch: 'any',
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ technologies: { some: { technologyId: { in: ids } } } }],
    });
  });

  it('should filter by technologyIds with any when technologyMatch default', () => {
    const ids = ['b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b'];
    const query = {
      page: 1,
      limit: 10,
      technologyIds: ids,
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ technologies: { some: { technologyId: { in: ids } } } }],
    });
  });

  it('should filter by technologyIds with all (AND of some)', () => {
    const ids = [
      'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b',
      'c3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7c',
    ];
    const query = {
      page: 1,
      limit: 10,
      technologyIds: ids,
      technologyMatch: 'all',
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [
        { technologies: { some: { technologyId: ids[0] } } },
        { technologies: { some: { technologyId: ids[1] } } },
      ],
    });
  });

  it('should filter by appliedFrom only', () => {
    const query = {
      page: 1,
      limit: 10,
      appliedFrom: '2026-01-01T00:00:00.000Z',
    } as FindApplicationsQueryDto;
    const where = buildWhere(query);
    expect(where).toEqual({
      AND: [{ appliedAt: { gte: new Date('2026-01-01T00:00:00.000Z') } }],
    });
  });

  it('should filter by appliedTo only', () => {
    const query = {
      page: 1,
      limit: 10,
      appliedTo: '2026-12-31T00:00:00.000Z',
    } as FindApplicationsQueryDto;
    const where = buildWhere(query);
    expect(where).toEqual({
      AND: [{ appliedAt: { lte: new Date('2026-12-31T00:00:00.000Z') } }],
    });
  });

  it('should filter by appliedFrom and appliedTo', () => {
    const query = {
      page: 1,
      limit: 10,
      appliedFrom: '2026-01-01T00:00:00.000Z',
      appliedTo: '2026-01-31T00:00:00.000Z',
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [
        { appliedAt: { gte: new Date('2026-01-01T00:00:00.000Z') } },
        { appliedAt: { lte: new Date('2026-01-31T00:00:00.000Z') } },
      ],
    });
  });

  it('should filter by minSalary (salaryMax >= minSalary)', () => {
    const query = {
      page: 1,
      limit: 10,
      minSalary: 50000,
      salaryCurrency: Currency.USD,
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ salaryMax: { gte: 50000 } }, { salaryCurrency: Currency.USD }],
    });
  });

  it('should filter by maxSalary (salaryMin <= maxSalary)', () => {
    const query = {
      page: 1,
      limit: 10,
      maxSalary: 100000,
      salaryCurrency: Currency.USD,
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ salaryMin: { lte: 100000 } }, { salaryCurrency: Currency.USD }],
    });
  });

  it('should filter by salary range overlap and currency', () => {
    const query = {
      page: 1,
      limit: 10,
      minSalary: 60000,
      maxSalary: 90000,
      salaryCurrency: Currency.EUR,
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [
        { salaryMax: { gte: 60000 } },
        { salaryMin: { lte: 90000 } },
        { salaryCurrency: Currency.EUR },
      ],
    });
  });

  it('should filter hasNotes true -> some', () => {
    const query = {
      page: 1,
      limit: 10,
      hasNotes: true,
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ notes: { some: {} } }],
    });
  });

  it('should filter hasNotes false -> none', () => {
    const query = {
      page: 1,
      limit: 10,
      hasNotes: false,
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ notes: { none: {} } }],
    });
  });

  it('should filter hasSalary true -> OR not null', () => {
    const query = {
      page: 1,
      limit: 10,
      hasSalary: true,
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [
        { OR: [{ salaryMin: { not: null } }, { salaryMax: { not: null } }] },
      ],
    });
  });

  it('should filter hasSalary false -> both null', () => {
    const query = {
      page: 1,
      limit: 10,
      hasSalary: false,
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ salaryMin: null, salaryMax: null }],
    });
  });

  it('should filter hasJobUrl true -> not null', () => {
    const query = {
      page: 1,
      limit: 10,
      hasJobUrl: true,
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ jobUrl: { not: null } }],
    });
  });

  it('should filter hasJobUrl false -> null', () => {
    const query = {
      page: 1,
      limit: 10,
      hasJobUrl: false,
    } as FindApplicationsQueryDto;
    expect(buildWhere(query)).toEqual({
      AND: [{ jobUrl: null }],
    });
  });
});

describe('buildOrderBy', () => {
  it('should use default createdAt desc with id tiebreaker', () => {
    const query = { page: 1, limit: 10 } as FindApplicationsQueryDto;
    expect(buildOrderBy(query)).toEqual([
      { createdAt: 'desc' },
      { id: 'desc' },
    ]);
  });

  it('should respect sortBy and order', () => {
    const query = {
      page: 1,
      limit: 10,
      sortBy: 'title',
      order: 'asc',
    } as unknown as FindApplicationsQueryDto;
    expect(buildOrderBy(query)).toEqual([{ title: 'asc' }, { id: 'asc' }]);
  });

  it('should handle each whitelisted sortBy', () => {
    const fields = [
      'appliedAt',
      'createdAt',
      'title',
      'salaryMin',
      'salaryMax',
      'position',
    ] as const;
    for (const field of fields) {
      const query = {
        page: 1,
        limit: 10,
        sortBy: field,
        order: 'desc',
      } as FindApplicationsQueryDto;
      const orderBy = buildOrderBy(query);
      if (field === 'salaryMin' || field === 'salaryMax') {
        expect(orderBy).toEqual([
          { [field]: { sort: 'desc', nulls: 'last' } },
          { id: 'desc' },
        ]);
      } else {
        expect(orderBy).toEqual([{ [field]: 'desc' }, { id: 'desc' }]);
      }
    }
  });

  it('should use nulls last for salaryMin', () => {
    const query = {
      page: 1,
      limit: 10,
      sortBy: 'salaryMin',
      order: 'asc',
    } as FindApplicationsQueryDto;
    expect(buildOrderBy(query)).toEqual([
      { salaryMin: { sort: 'asc', nulls: 'last' } },
      { id: 'asc' },
    ]);
  });

  it('should use nulls last for salaryMax', () => {
    const query = {
      page: 1,
      limit: 10,
      sortBy: 'salaryMax',
      order: 'desc',
    } as FindApplicationsQueryDto;
    expect(buildOrderBy(query)).toEqual([
      { salaryMax: { sort: 'desc', nulls: 'last' } },
      { id: 'desc' },
    ]);
  });

  it('should always include id tiebreaker with same order', () => {
    const query = {
      page: 1,
      limit: 10,
      sortBy: 'position',
      order: 'asc',
    } as FindApplicationsQueryDto;
    expect(buildOrderBy(query)).toEqual([{ position: 'asc' }, { id: 'asc' }]);
  });
});
