import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Preference } from '../../common/entities/preference.entity.js';
import { UpdatePreferenceDto } from './dto/update-preference.dto.js';
import { PreferenceService } from './preference.service.js';

@ApiTags('Preferences')
@Controller('preferences')
export class PreferenceController {
  constructor(private readonly preferenceService: PreferenceService) {}

  @Get()
  @ApiOperation({ summary: 'Get preferences for the current user' })
  @ApiResponse({ status: 200, description: 'The found preference', type: Preference })
  @ApiResponse({ status: 404, description: 'Preference not found' })
  getPreference(@CurrentUser('userId') userId: string) {
    return this.preferenceService.findOne(userId);
  }

  @Put()
  @ApiOperation({ summary: 'Update or create preferences for the current user' })
  @ApiResponse({ status: 200, description: 'Preference updated or created' })
  updatePreference(
    @CurrentUser('userId') userId: string,
    @Body() updatePreferenceDto: UpdatePreferenceDto,
  ) {
    return this.preferenceService.updatePreference(userId, updatePreferenceDto);
  }
}
