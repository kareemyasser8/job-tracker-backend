import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TechnologyService } from './technology.service.js';

describe('TechnologyService', () => {
  let service: TechnologyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TechnologyService,
        {
          provide: PrismaService,
          useValue: {
            technology: {
              create: vi.fn(),
              findMany: vi.fn(),
              count: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<TechnologyService>(TechnologyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
