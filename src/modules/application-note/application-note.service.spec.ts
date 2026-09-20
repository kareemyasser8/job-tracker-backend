import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateApplicationNoteDto } from './dto/create-application-note.dto.js';
import { UpdateApplicationNoteDto } from './dto/update-application-note.dto.js';
import { ApplicationNoteService } from './application-note.service.js';

const APPLICATION_NOTE_SELECT = {
  id: true,
  applicationId: true,
  content: true,
  createdAt: true,
} as const;

describe('ApplicationNoteService', () => {
  let service: ApplicationNoteService;

  const prismaService = {
    applicationNote: {
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
        ApplicationNoteService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<ApplicationNoteService>(ApplicationNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createApplicationNote', () => {
    it('should create an application note', async () => {
      const createDto: CreateApplicationNoteDto = {
        applicationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        content: 'Followed up via email',
      };

      const created = {
        id: 'note-1',
        applicationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        content: 'Followed up via email',
        createdAt: new Date(),
      };

      prismaService.applicationNote.create.mockResolvedValue(created);

      const result = await service.createApplicationNote(createDto);

      expect(prismaService.applicationNote.create).toHaveBeenCalledWith({
        data: {
          applicationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          content: 'Followed up via email',
        },
        select: APPLICATION_NOTE_SELECT,
      });

      expect(result).toEqual(created);
    });
  });

  describe('findAll', () => {
    it('should return paginated application notes', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 2,
        limit: 10,
      };

      const notes = [
        {
          id: 'note-1',
          applicationId: 'app-1',
          content: 'Note 1',
          createdAt: new Date(),
        },
        {
          id: 'note-2',
          applicationId: 'app-1',
          content: 'Note 2',
          createdAt: new Date(),
        },
      ];

      prismaService.applicationNote.findMany.mockResolvedValue(notes);
      prismaService.applicationNote.count.mockResolvedValue(25);

      const result = await service.findAll(paginationQuery);

      expect(prismaService.applicationNote.findMany).toHaveBeenCalledWith({
        skip: 10,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: APPLICATION_NOTE_SELECT,
      });

      expect(prismaService.applicationNote.count).toHaveBeenCalledWith();

      expect(result).toEqual({
        total: 25,
        data: notes,
      });
    });

    it('should calculate skip correctly for the first page', async () => {
      const paginationQuery: PaginationQueryDto = {
        page: 1,
        limit: 20,
      };

      prismaService.applicationNote.findMany.mockResolvedValue([]);
      prismaService.applicationNote.count.mockResolvedValue(0);

      await service.findAll(paginationQuery);

      expect(prismaService.applicationNote.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 20,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return an application note by id', async () => {
      const note = {
        id: 'note-1',
        applicationId: 'app-1',
        content: 'Some content',
        createdAt: new Date(),
      };

      prismaService.applicationNote.findUnique.mockResolvedValue(note);

      const result = await service.findOne('note-1');

      expect(prismaService.applicationNote.findUnique).toHaveBeenCalledWith({
        where: {
          id: 'note-1',
        },
        select: APPLICATION_NOTE_SELECT,
      });

      expect(result).toEqual(note);
    });

    it('should throw NotFoundException when application note does not exist', async () => {
      prismaService.applicationNote.findUnique.mockResolvedValue(null);

      await expect(service.findOne('note-999')).rejects.toThrow(
        new NotFoundException('ApplicationNote with id note-999 not found'),
      );
    });
  });

  describe('updateOne', () => {
    it('should update an application note', async () => {
      const updateDto: UpdateApplicationNoteDto = {
        content: 'Updated content',
      };

      const updated = {
        id: 'note-1',
        applicationId: 'app-1',
        content: 'Updated content',
        createdAt: new Date(),
      };

      prismaService.applicationNote.update.mockResolvedValue(updated);

      const result = await service.updateOne('note-1', updateDto);

      expect(prismaService.applicationNote.update).toHaveBeenCalledWith({
        where: { id: 'note-1' },
        data: {
          applicationId: undefined,
          content: 'Updated content',
        },
        select: APPLICATION_NOTE_SELECT,
      });

      expect(result).toEqual(updated);
    });

    it('should update only provided fields', async () => {
      const updateDto: UpdateApplicationNoteDto = {
        content: 'Partial update',
      };

      const updated = {
        id: 'note-1',
        applicationId: 'app-1',
        content: 'Partial update',
        createdAt: new Date(),
      };

      prismaService.applicationNote.update.mockResolvedValue(updated);

      const result = await service.updateOne('note-1', updateDto);

      expect(prismaService.applicationNote.update).toHaveBeenCalledWith({
        where: {
          id: 'note-1',
        },
        data: {
          applicationId: undefined,
          content: 'Partial update',
        },
        select: APPLICATION_NOTE_SELECT,
      });

      expect(result).toEqual(updated);
    });
  });

  describe('deleteOne', () => {
    it('should delete an application note', async () => {
      prismaService.applicationNote.delete.mockResolvedValue({});

      await service.deleteOne('note-1');

      expect(prismaService.applicationNote.delete).toHaveBeenCalledWith({
        where: { id: 'note-1' },
      });
    });
  });
});
