import { IsArray, IsNumber } from 'class-validator';

export class DeleteMessageDto {
   @IsArray()
   messageIds: number[];

   @IsNumber()
   roomId: number;
}
