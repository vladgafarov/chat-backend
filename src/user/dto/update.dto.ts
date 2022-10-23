import { IsOptional, IsString } from 'class-validator';
import {} from '@nestjs/common';

export class UpdateDto {
   @IsString()
   @IsOptional()
   name?: string;

   @IsString()
   @IsOptional()
   email?: string;

   @IsString()
   @IsOptional()
   avatarUrl?: string;

   @IsString()
   @IsOptional()
   avatarThumbnailUrl?: string;

   @IsString()
   @IsOptional()
   avatarThumbnail?: string;
}
