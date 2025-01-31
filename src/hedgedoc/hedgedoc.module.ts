import { Module } from '@nestjs/common';
import { HedgedocService } from './hedgedoc.service';
import { HedgedocController } from './hedgedoc.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [HedgedocController],
  providers: [HedgedocService],
  exports: [HedgedocService],
})
export class HedgedocModule {}
