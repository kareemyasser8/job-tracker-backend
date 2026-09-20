import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service.js';
import { TechnologyController } from './technology.controller.js';
import { TechnologyService } from './technology.service.js';

describe('TechnologyController', () => {
  let controller: TechnologyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TechnologyController],
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

    controller = module.get<TechnologyController>(TechnologyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
