import { Module } from '@nestjs/common';
import { SourceService } from './source.service.js';
import { SourceController } from './source.controller.js';

@Module({
  controllers: [SourceController],
  providers: [SourceService],
})
export class SourceModule {}
