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

const USER_ID = 'user-1';
const OTHER_USER_ID = 'user-2';

describe('ApplicationNoteService', () => {
  let service: ApplicationNoteService;

  const prismaService: any = {
    applicationNote: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    application: {
      findFirst: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApplicationNoteService, { provide: PrismaService, useValue: prismaService }],
    }).compile();

    service = module.get<ApplicationNoteService>(ApplicationNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createApplicationNote', () => {
    it('should create when application belongs to user', async () => {
      prismaService.application.findFirst.mockResolvedValue({ id: 'app-1' });
      const createDto: CreateApplicationNoteDto = { applicationId: 'app-1', content: 'Followed up' };
      const created = { id: 'note-1', applicationId: 'app-1', content: 'Followed up', createdAt: new Date() };
      prismaService.applicationNote.create.mockResolvedValue(created);

      const result = await service.createApplicationNote(createDto, USER_ID);

      expect(prismaService.application.findFirst).toHaveBeenCalledWith({ where: { id: 'app-1', userId: USER_ID }, select: { id: true } });
      expect(prismaService.applicationNote.create).toHaveBeenCalledWith({
        data: { applicationId: 'app-1', content: 'Followed up' },
        select: APPLICATION_NOTE_SELECT,
      });
      expect(result).toEqual(created);
    });

    it('should throw NotFound if application not owned', async () => {
      prismaService.application.findFirst.mockResolvedValue(null);
      const dto: CreateApplicationNoteDto = { applicationId: 'app-1', content: 'x' };
      await expect(service.createApplicationNote(dto, OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated notes filtered by user', async () => {
      const paginationQuery: PaginationQueryDto = { page: 1, limit: 10 };
      const notes = [{ id: 'note-1', applicationId: 'app-1', content: 'Note', createdAt: new Date() }];
      prismaService.applicationNote.findMany.mockResolvedValue(notes);
      prismaService.applicationNote.count.mockResolvedValue(1);

      const result = await service.findAll(paginationQuery, USER_ID);

      const where = { application: { userId: USER_ID } };
      expect(prismaService.applicationNote.findMany).toHaveBeenCalledWith({ where, skip: 0, take: 10, orderBy: { createdAt: 'desc' }, select: APPLICATION_NOTE_SELECT });
      expect(prismaService.applicationNote.count).toHaveBeenCalledWith({ where });
      expect(result).toEqual({ total: 1, data: notes });
    });
  });

  describe('findOne', () => {
    it('should return note when owned via application', async () => {
      const note = { id: 'note-1', applicationId: 'app-1', content: 'Some', createdAt: new Date() };
      prismaService.applicationNote.findFirst.mockResolvedValue(note);
      const result = await service.findOne('note-1', USER_ID);
      expect(prismaService.applicationNote.findFirst).toHaveBeenCalledWith({ where: { id: 'note-1', application: { userId: USER_ID } }, select: APPLICATION_NOTE_SELECT });
      expect(result).toEqual(note);
    });

    it('should throw NotFound for other user', async () => {
      prismaService.applicationNote.findFirst.mockResolvedValue(null);
      await expect(service.findOne('note-1', OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateOne', () => {
    it('should update note owned by user', async () => {
      prismaService.applicationNote.findFirst.mockResolvedValue({ id: 'note-1', applicationId: 'app-1' });
      const updated = { id: 'note-1', applicationId: 'app-1', content: 'Updated', createdAt: new Date() };
      prismaService.applicationNote.update.mockResolvedValue(updated);

      const result = await service.updateOne('note-1', { content: 'Updated' } as UpdateApplicationNoteDto, USER_ID);

      expect(result).toEqual(updated);
      expect(prismaService.applicationNote.update).toHaveBeenCalledWith({
        where: { id: 'note-1' },
        data: { applicationId: undefined, content: 'Updated' },
        select: APPLICATION_NOTE_SELECT,
      });
    });

    it('should throw NotFound for other user note', async () => {
      prismaService.applicationNote.findFirst.mockResolvedValue(null);
      await expect(service.updateOne('note-1', { content: 'x' } as UpdateApplicationNoteDto, OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should check new applicationId belongs to user when moving note', async () => {
      prismaService.applicationNote.findFirst.mockResolvedValue({ id: 'note-1', applicationId: 'app-1' });
      prismaService.application.findFirst.mockResolvedValue(null);
      await expect(service.updateOne('note-1', { applicationId: 'app-2', content: 'x' } as UpdateApplicationNoteDto, USER_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteOne', () => {
    it('should delete owned note', async () => {
      prismaService.applicationNote.findFirst.mockResolvedValue({ id: 'note-1' });
      prismaService.applicationNote.delete.mockResolvedValue({});
      await service.deleteOne('note-1', USER_ID);
      expect(prismaService.applicationNote.delete).toHaveBeenCalledWith({ where: { id: 'note-1' } });
    });

    it('should throw NotFound for other user', async () => {
      prismaService.applicationNote.findFirst.mockResolvedValue(null);
      await expect(service.deleteOne('note-1', OTHER_USER_ID)).rejects.toThrow(NotFoundException);
    });
  });
});
