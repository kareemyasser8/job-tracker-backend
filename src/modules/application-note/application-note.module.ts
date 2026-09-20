import { Module } from '@nestjs/common';
import { ApplicationNoteService } from './application-note.service.js';
import { ApplicationNoteController } from './application-note.controller.js';

@Module({
  controllers: [ApplicationNoteController],
  providers: [ApplicationNoteService],
})
export class ApplicationNoteModule {}
