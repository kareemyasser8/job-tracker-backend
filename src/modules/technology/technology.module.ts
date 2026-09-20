import { Module } from '@nestjs/common';
import { TechnologyService } from './technology.service.js';
import { TechnologyController } from './technology.controller.js';

@Module({
  controllers: [TechnologyController],
  providers: [TechnologyService],
})
export class TechnologyModule {}
