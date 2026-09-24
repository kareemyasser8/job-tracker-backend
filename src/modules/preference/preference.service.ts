import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Preference } from '../../common/entities/preference.entity.js';
import { UpdatePreferenceDto } from './dto/update-preference.dto.js';

@Injectable()
export class PreferenceService {
  constructor(private readonly prismaService: PrismaService) {}

  async findOne(userId: string): Promise<Preference> {
    const preference = await this.prismaService.preference.findUnique({
      where: { userId },
      select: {
        isDarkMode: true,
        isGridLayout: true,
      },
    });
    if (!preference) {
      throw new NotFoundException(`Preference for user ${userId} not found`);
    }
    return preference;
  }

  async updatePreference(userId: string, updatePreferenceDto: UpdatePreferenceDto) {
    return this.prismaService.preference.upsert({
      where: { userId },
      create: {
        userId,
        isDarkMode: updatePreferenceDto?.isDarkMode ?? false,
        isGridLayout: updatePreferenceDto?.isGridLayout ?? false,
      },
      update: {
        isDarkMode: updatePreferenceDto?.isDarkMode,
        isGridLayout: updatePreferenceDto?.isGridLayout,
      },
      select: {
        isDarkMode: true,
        isGridLayout: true,
      },
    });
  }
}