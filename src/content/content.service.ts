import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { SocialPostEntity } from './entities/social-post.entity';
import { SocialPostDataDto } from './dto/social-post.dto';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(SocialPostEntity)
    private readonly socialPostRepository: Repository<SocialPostEntity>,
  ) {}

  async findSocialPosts() {
    return this.socialPostRepository.find();
  }

  createSocialPost(post: SocialPostDataDto) {
    return this.socialPostRepository.save(post);
  }

  findAll() {
    return `This action returns all content`;
  }

  findOne(id: number) {
    return `This action returns a #${id} content`;
  }

  update(id: number, updateContentDto: UpdateContentDto) {
    return `This action updates a #${id} content`;
  }

  remove(id: number) {
    return `This action removes a #${id} content`;
  }
}
