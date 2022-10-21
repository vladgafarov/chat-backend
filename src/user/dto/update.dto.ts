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
   avatarThumbnail?: string;

   action?:
      | 'initial'
      | 'uploadingAvatar'
      | 'deletingAvatar'
      | 'changeThumbnail';
}
