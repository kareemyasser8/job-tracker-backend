import { Module } from '@nestjs/common';
import { PreferenceService } from './preference.service.js';
import { PreferenceController } from './preference.controller.js';

@Module({
  controllers: [PreferenceController],
  providers: [PreferenceService],
})
export class PreferenceModule {}
