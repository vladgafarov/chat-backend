import { IsArray, IsNumber, IsString } from 'class-validator';

export class ForwardMessageDto {
   @IsNumber()
   roomId: number;

   @IsNumber()
   userId: number;

   @IsArray()
   messageIds: number[];

   @IsArray()
   roomIds: number[];

   @IsString()
   text: string;
}
