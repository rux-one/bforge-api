import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { ContentController } from './content.controller';
import { SocialPostEntity } from './entities/social-post.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([SocialPostEntity])],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}
