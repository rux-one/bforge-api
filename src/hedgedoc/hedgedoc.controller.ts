import {
  Controller,
  Body,
  Put,
  Param,
} from '@nestjs/common';
import { HedgedocService } from './hedgedoc.service';
import { HedgedocNoteDto } from './dto/hedgedoc-note.dto';

@Controller('hedgedoc')
export class HedgedocController {
  constructor(private readonly service: HedgedocService) {}

  @Put(':slug')
  async putNoteContent(@Body() content: HedgedocNoteDto, @Param('slug') slug: string) {
    try {
      await this.service.overrideNote(slug, content.content);

      return {
        success: true,
        slug,
      };
    } catch (e) {
      console.error(e);

      return {
        success: false,
        slug,
        error: e.message,
      };
    }
  }
}