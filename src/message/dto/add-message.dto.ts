import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class AddMessageDto {
   @Type(() => String)
   @IsString()
   roomId: string;

   @Type(() => String)
   @IsString()
   text: string;

   @Type(() => String)
   @IsString()
   @IsOptional()
   repliedMessageId?: string;
}
