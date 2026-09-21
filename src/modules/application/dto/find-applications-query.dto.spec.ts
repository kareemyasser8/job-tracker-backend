import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindApplicationsQueryDto } from './find-applications-query.dto.js';
import {
  Currency,
  ApplicationStatus,
} from '../../../generated/prisma/enums.js';

describe('FindApplicationsQueryDto', () => {
  it('should transform single scalar status to array', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      status: ApplicationStatus.APPLIED,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.status).toEqual([ApplicationStatus.APPLIED]);
  });

  it('should keep array status as array', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      status: [ApplicationStatus.APPLIED, ApplicationStatus.OFFER],
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.status).toEqual([
      ApplicationStatus.APPLIED,
      ApplicationStatus.OFFER,
    ]);
  });

  it('should fail for invalid enum value', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      status: 'INVALID',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
  });

  it('should fail for invalid uuid', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      companyId: 'not-a-uuid',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('companyId');
  });

  it('should transform scalar uuid to array', async () => {
    const id = '3fa85f64-5717-4562-b3fc-2c963f66afa6';
    const dto = plainToInstance(FindApplicationsQueryDto, { companyId: id });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.companyId).toEqual([id]);
  });

  it('should parse "false" to false for boolean flags', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      hasSalary: 'false',
      hasJobUrl: 'false',
      hasNotes: 'false',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.hasSalary).toBe(false);
    expect(dto.hasJobUrl).toBe(false);
    expect(dto.hasNotes).toBe(false);
  });

  it('should parse "true" to true for boolean flags', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      hasSalary: 'true',
      hasJobUrl: true,
      hasNotes: 'true',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.hasSalary).toBe(true);
    expect(dto.hasJobUrl).toBe(true);
    expect(dto.hasNotes).toBe(true);
  });

  it('should fail for sortBy outside whitelist', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      sortBy: 'invalidField',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('sortBy');
  });

  it('should accept whitelisted sortBy values', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      sortBy: 'salaryMin',
      order: 'asc',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.sortBy).toBe('salaryMin');
  });

  it('should fail when minSalary without salaryCurrency', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, { minSalary: 50000 });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'salaryCurrency')).toBe(true);
  });

  it('should fail when maxSalary without salaryCurrency', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      maxSalary: 100000,
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors.some((e) => e.property === 'salaryCurrency')).toBe(true);
  });

  it('should pass when minSalary with salaryCurrency', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      minSalary: 50000,
      salaryCurrency: Currency.USD,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should pass when maxSalary with salaryCurrency', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      maxSalary: 50000,
      salaryCurrency: Currency.USD,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should validate page/limit as before', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      page: 0,
      limit: 10,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'page')).toBe(true);

    const dto2 = plainToInstance(FindApplicationsQueryDto, {
      page: 1,
      limit: 0,
    });
    const errors2 = await validate(dto2);
    expect(errors2.some((e) => e.property === 'limit')).toBe(true);

    const dto3 = plainToInstance(FindApplicationsQueryDto, {
      page: 1,
      limit: 10,
    });
    const errors3 = await validate(dto3);
    expect(errors3.length).toBe(0);
  });

  it('should transform page/limit string to number', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      page: '2',
      limit: '20',
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(20);
  });

  it('should fail for invalid workMode enum', async () => {
    const dto = plainToInstance(FindApplicationsQueryDto, {
      workMode: 'INVALID',
    });
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should transform search and validate maxLength', async () => {
    const long = 'a'.repeat(101);
    const dto = plainToInstance(FindApplicationsQueryDto, { search: long });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'search')).toBe(true);
  });

  it('should handle technologyIds scalar to array', async () => {
    const id = 'b3f1c2a4-5d6e-4f80-9a1b-2c3d4e5f6a7b';
    const dto = plainToInstance(FindApplicationsQueryDto, {
      technologyIds: id,
    });
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
    expect(dto.technologyIds).toEqual([id]);
  });
});
