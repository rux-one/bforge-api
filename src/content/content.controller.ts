import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Patch,
  Param,
} from '@nestjs/common';
import { ContentService } from './content.service';
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

  @Put('social-posts/:id/archive')
  archiveSocialPost(@Param('id') id: string) {
    return this.contentService.updateSocialPost(id, {
      archivedAt: new Date(),
    });
  }

  @Patch('social-posts/:id')
  updateSocialPost(
    @Param('id') id: string,
    @Body() post: Partial<SocialPostDataDto>,
  ) {
    return this.contentService.updateSocialPost(id, post);
  }

  @Delete('social-posts/:id')
  deleteSocialPost(@Param('id') id: string) {
    return this.contentService.deleteSocialPost(id);
  }
}
