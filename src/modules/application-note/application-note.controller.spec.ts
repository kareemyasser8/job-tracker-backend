import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { vi } from 'vitest';
import { ApplicationNote } from '../../common/entities/application-note.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ApplicationNoteController } from './application-note.controller.js';
import { ApplicationNoteService } from './application-note.service.js';

const mockApplicationNote: ApplicationNote = {
  id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  applicationId: '4fa85f64-5717-4562-b3fc-2c963f66afa7',
  content: 'Followed up via email, awaiting response.',
  createdAt: new Date('2026-09-14T10:55:11.715Z'),
};

describe('ApplicationNoteController', () => {
  let controller: ApplicationNoteController;
  let service: ApplicationNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationNoteController],
      providers: [
        ApplicationNoteService,
        {
          provide: PrismaService,
          useValue: {
            applicationNote: {
              create: vi.fn(),
              findMany: vi.fn(),
              findUnique: vi.fn(),
              update: vi.fn(),
              delete: vi.fn(),
              count: vi.fn(),
            },
          },
        },
      ],
    }).compile();

    controller = module.get<ApplicationNoteController>(ApplicationNoteController);
    service = module.get<ApplicationNoteService>(ApplicationNoteService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getApplicationNotes', () => {
    it('should return paginated application notes', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({
        total: 1,
        data: [mockApplicationNote],
      });

      const result = await controller.getApplicationNotes({ page: 1, limit: 10 });

      expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
      expect(result).toEqual({ total: 1, data: [mockApplicationNote] });
    });

    it('should return an empty page when there are no application notes', async () => {
      vi.spyOn(service, 'findAll').mockResolvedValue({ total: 0, data: [] });

      const result = await controller.getApplicationNotes({ page: 1, limit: 10 });

      expect(result).toEqual({ total: 0, data: [] });
    });
  });

  describe('getApplicationNote', () => {
    it('should return an application note by id', async () => {
      vi.spyOn(service, 'findOne').mockResolvedValue(mockApplicationNote);

      const result = await controller.getApplicationNote(mockApplicationNote.id);

      expect(service.findOne).toHaveBeenCalledWith(mockApplicationNote.id);
      expect(result).toEqual(mockApplicationNote);
    });

    it('should propagate NotFoundException for a missing application note', async () => {
      vi.spyOn(service, 'findOne').mockRejectedValue(
        new NotFoundException('ApplicationNote with id 999 not found'),
      );

      await expect(controller.getApplicationNote('999')).rejects.toThrow(NotFoundException);
      await expect(controller.getApplicationNote('999')).rejects.toThrow(
        'ApplicationNote with id 999 not found',
      );
    });
  });

  describe('createApplicationNote', () => {
    it('should create an application note and return it', async () => {
      const dto = {
        applicationId: mockApplicationNote.applicationId,
        content: 'Followed up via email, awaiting response.',
      };
      vi.spyOn(service, 'createApplicationNote').mockResolvedValue(mockApplicationNote);

      const result = await controller.createApplicationNote(dto);

      expect(service.createApplicationNote).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockApplicationNote);
    });
  });

  describe('updateApplicationNote', () => {
    it('should update an application note and return the updated record', async () => {
      const dto = { content: 'Updated content' };
      const updated = { ...mockApplicationNote, content: 'Updated content' };
      vi.spyOn(service, 'updateOne').mockResolvedValue(updated);

      const result = await controller.updateApplicationNote(mockApplicationNote.id, dto);

      expect(service.updateOne).toHaveBeenCalledWith(mockApplicationNote.id, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('deleteApplicationNote', () => {
    it('should delete an application note', async () => {
      vi.spyOn(service, 'deleteOne').mockResolvedValue(undefined);

      const result = await controller.deleteApplicationNote(mockApplicationNote.id);

      expect(service.deleteOne).toHaveBeenCalledWith(mockApplicationNote.id);
      expect(result).toBeUndefined();
    });
  });
});
