import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { SocialPostEntity } from './entities/social-post.entity';
import { SocialPostDataDto } from './dto/social-post.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(SocialPostEntity)
    private readonly socialPostRepository: Repository<SocialPostEntity>,
  ) {}

  async findSocialPosts() {
    return this.socialPostRepository.find({
      order: {
        weight: 'ASC',
      },
      where: {
        validFrom: LessThan(new Date()),
      },
    });
  }

  createSocialPost(post: SocialPostDataDto) {
    return this.socialPostRepository.save(post);
  }
}
