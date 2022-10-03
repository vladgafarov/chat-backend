import { IsNumber, IsString } from 'class-validator';

export class UpdateMessageDto {
   @IsNumber()
   messageId: number;

   @IsNumber()
   roomId: number;

   @IsString()
   text: string;
}
