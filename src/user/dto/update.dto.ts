import { IsOptional, IsString } from 'class-validator';

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
}
