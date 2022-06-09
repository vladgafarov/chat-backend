import { IsNumber, IsString } from 'class-validator';

export class AddMessageDto {
   @IsNumber()
   authorId: number;

   @IsNumber()
   roomId: number;

   @IsString()
   text: string;
}
