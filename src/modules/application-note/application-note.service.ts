import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto.js';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { CreateApplicationNoteDto } from './dto/create-application-note.dto.js';
import { UpdateApplicationNoteDto } from './dto/update-application-note.dto.js';

const applicationNoteSelect = {
  id: true,
  applicationId: true,
  content: true,
  createdAt: true,
} satisfies Prisma.ApplicationNoteSelect;

@Injectable()
export class ApplicationNoteService {
  constructor(private readonly prismaService: PrismaService) {}

  private async assertApplicationOwned(applicationId: string, userId: string) {
    const app = await this.prismaService.application.findFirst({
      where: { id: applicationId, userId },
      select: { id: true },
    });
    if (!app) {
      throw new NotFoundException(`Application with id ${applicationId} not found`);
    }
  }

  async createApplicationNote(
    createApplicationNoteDto: CreateApplicationNoteDto,
    userId: string,
  ) {
    await this.assertApplicationOwned(createApplicationNoteDto.applicationId, userId);

    return this.prismaService.applicationNote.create({
      data: {
        applicationId: createApplicationNoteDto.applicationId,
        content: createApplicationNoteDto.content,
      },
      select: applicationNoteSelect,
    });
  }

  async findAll(paginationQuery: PaginationQueryDto, userId: string) {
    const { page, limit } = paginationQuery;
    const skip = (page - 1) * limit;

    const where: Prisma.ApplicationNoteWhereInput = {
      application: { userId },
    };

    const [data, total] = await Promise.all([
      this.prismaService.applicationNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: applicationNoteSelect,
      }),
      this.prismaService.applicationNote.count({ where }),
    ]);

    return { total, data };
  }

  async findOne(id: string, userId: string) {
    const note = await this.prismaService.applicationNote.findFirst({
      where: { id, application: { userId } },
      select: applicationNoteSelect,
    });

    if (!note) {
      throw new NotFoundException(`ApplicationNote with id ${id} not found`);
    }
    return note;
  }

  async updateOne(
    id: string,
    updateApplicationNoteDto: UpdateApplicationNoteDto,
    userId: string,
  ) {
    const existing = await this.prismaService.applicationNote.findFirst({
      where: { id, application: { userId } },
      select: { id: true, applicationId: true },
    });

    if (!existing) {
      throw new NotFoundException(`ApplicationNote with id ${id} not found`);
    }

    if (
      updateApplicationNoteDto.applicationId &&
      updateApplicationNoteDto.applicationId !== existing.applicationId
    ) {
      await this.assertApplicationOwned(updateApplicationNoteDto.applicationId, userId);
    }

    return this.prismaService.applicationNote.update({
      where: { id },
      data: {
        applicationId: updateApplicationNoteDto?.applicationId,
        content: updateApplicationNoteDto?.content,
      },
      select: applicationNoteSelect,
    });
  }

  async deleteOne(id: string, userId: string): Promise<void> {
    const existing = await this.prismaService.applicationNote.findFirst({
      where: { id, application: { userId } },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`ApplicationNote with id ${id} not found`);
    }

    await this.prismaService.applicationNote.delete({ where: { id } });
  }
}
