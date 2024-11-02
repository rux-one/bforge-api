import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentModule } from './content/content.module';

@Module({
  imports: [ConfigModule.forRoot(), ContentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
