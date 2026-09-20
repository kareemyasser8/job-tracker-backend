import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { ApplicationNote } from '../../common/entities/application-note.entity.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateApplicationNoteDto } from './dto/create-application-note.dto.js';
import { UpdateApplicationNoteDto } from './dto/update-application-note.dto.js';

@Injectable()
export class ApplicationNoteService {
  constructor(private readonly prismaService: PrismaService) {}

  async createApplicationNote(
    createApplicationNoteDto: CreateApplicationNoteDto,
  ): Promise<ApplicationNote> {
    return this.prismaService.applicationNote.create({
      data: {
        applicationId: createApplicationNoteDto.applicationId,
        content: createApplicationNoteDto.content,
      },
      select: {
        id: true,
        applicationId: true,
        content: true,
        createdAt: true,
      },
    }) as unknown as Promise<ApplicationNote>;
  }

  async findAll(
    paginationQuery: PaginationQueryDto,
  ): Promise<{ total: number; data: ApplicationNote[] }> {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prismaService.applicationNote.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          applicationId: true,
          content: true,
          createdAt: true,
        },
      }) as unknown as Promise<ApplicationNote[]>,
      this.prismaService.applicationNote.count(),
    ]);

    return { total, data };
  }

  async findOne(id: string): Promise<ApplicationNote> {
    const applicationNote = (await this.prismaService.applicationNote.findUnique({
      where: { id },
      select: {
        id: true,
        applicationId: true,
        content: true,
        createdAt: true,
      },
    })) as unknown as ApplicationNote | null;
    if (!applicationNote) {
      throw new NotFoundException(`ApplicationNote with id ${id} not found`);
    }
    return applicationNote;
  }

  async updateOne(
    id: string,
    updateApplicationNoteDto: UpdateApplicationNoteDto,
  ): Promise<ApplicationNote> {
    return this.prismaService.applicationNote.update({
      where: { id },
      data: {
        applicationId: updateApplicationNoteDto?.applicationId,
        content: updateApplicationNoteDto?.content,
      },
      select: {
        id: true,
        applicationId: true,
        content: true,
        createdAt: true,
      },
    }) as unknown as Promise<ApplicationNote>;
  }

  async deleteOne(id: string): Promise<void> {
    await this.prismaService.applicationNote.delete({
      where: { id },
    });
  }
}
