import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('social_posts')
export class SocialPostEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'name', length: 128, nullable: false })
  name: string;

  @Column({ name: 'content', length: 4096, nullable: false })
  content: string;

  @Column({ name: 'imageUrl', nullable: true })
  imageUrl: string;

  @Column({ name: 'weight', nullable: false, default: 0 })
  weight: number;

  @Column({ name: 'validFrom', nullable: true })
  validFrom: Date;

  @Column({ name: 'updatedAt', nullable: true })
  updatedAt: Date;

  @Column({ name: 'archivedAt', nullable: true })
  archivedAt: Date;
}
