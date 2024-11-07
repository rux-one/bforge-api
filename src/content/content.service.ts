import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import { SocialPostEntity } from './entities/social-post.entity';
import { SocialPostDataDto, SocialPostDto } from './dto/social-post.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(SocialPostEntity)
    private readonly socialPostRepository: Repository<SocialPostEntity>,
  ) {}

  async findSocialPosts(): Promise<SocialPostEntity[]> {
    return this.socialPostRepository.find({
      order: {
        weight: 'ASC',
      },
      where: {
        validFrom: LessThan(new Date()),
        archivedAt: IsNull(),
      },
    });
  }

  async createSocialPost(post: SocialPostDataDto): Promise<SocialPostDto> {
    return this.socialPostRepository.save(post);
  }

  async updateSocialPost(
    id: string,
    patch: Partial<SocialPostDataDto>,
  ): Promise<void> {
    await this.socialPostRepository.update(id, patch);
  }

  async deleteSocialPost(id: string): Promise<void> {
    await this.socialPostRepository.delete(id);
  }
}
