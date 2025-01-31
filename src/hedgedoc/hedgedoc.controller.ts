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
  async putNoteContent(@Body() payload: HedgedocNoteDto, @Param('slug') slug: string) {
    try {
      if (payload.append) {
        await this.service.appendNote(slug, payload.content);
      } else {
        await this.service.overrideNote(slug, payload.content);
      }

      return {
        success: true,
        append: payload.append,
        slug,
      };
    } catch (e) {
      console.error(e);

      return {
        success: false,
        append: payload.append,
        slug,
        error: e.message,
      };
    }
  }
}