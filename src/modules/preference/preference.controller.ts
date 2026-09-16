import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Preference } from '../../common/entities/preference.entity.js';
import { UpdatePreferenceDto } from './dto/update-preference.dto.js';
import { PreferenceService } from './preference.service.js';

@ApiTags('Preferences')
@Controller('preferences')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get(':userId')
  @ApiOperation({ summary: 'Get a preference by user id' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'The found preference', type: Preference })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  getPreference(@Param('userId') userId: string) {
    return this.preferenceService.findOne(userId);
  }

  @Put(':userId')
  @ApiOperation({ summary: 'Update or create a preference' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Preference updated or created' })
  updatePreference(@Param('userId') userId: string, @Body() updatePreferenceDto: UpdatePreferenceDto) {
    return this.preferenceService.updatePreference(userId, updatePreferenceDto);
  }

  @Delete(':userId')
  @ApiOperation({ summary: 'Delete a preference' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Preference deleted' })
  deletePreference(@Param('userId') userId: string) {
    return this.preferenceService.remove(userId);
  }
}