import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { SocialPostDataDto } from './dto/social-post.dto';

@Controller('content')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('social-posts')
  findSocialPosts() {
    return this.contentService.findSocialPosts();
  }

  @Post('social-posts')
  createSocialPost(@Body() post: SocialPostDataDto) {
    return this.contentService.createSocialPost(post);
  }
}
