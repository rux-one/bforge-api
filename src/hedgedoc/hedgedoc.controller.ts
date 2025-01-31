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
  putNoteContent(@Body() content: HedgedocNoteDto, @Param('slug') slug: string) {
    return {
      status: 'test',
      slug,
      content,
    };
  }
}