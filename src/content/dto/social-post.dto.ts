import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class SocialPostDataDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsString()
  imageUrl: string;

  @IsInt()
  weight: number;

  @IsOptional()
  validFrom: Date;

  @IsOptional()
  archivedAt: Date;
}

export class SocialPostDto extends SocialPostDataDto {
  @IsUUID()
  id: string;

  @IsOptional()
  updatedAt: Date;
}
