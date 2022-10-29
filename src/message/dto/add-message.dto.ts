import { IsNumber, IsString } from 'class-validator';

export class AddMessageDto {
   @IsNumber()
   roomId: number;

   @IsString()
   text: string;
}
