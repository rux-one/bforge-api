import { Module } from '@nestjs/common';
import { HedgedocService } from './hedgedoc.service';
import { HedgedocController } from './hedgedoc.controller';

@Module({
  imports: [],
  controllers: [HedgedocController],
  providers: [HedgedocService],
  exports: [HedgedocService],
})
export class HedgedocModule {}
