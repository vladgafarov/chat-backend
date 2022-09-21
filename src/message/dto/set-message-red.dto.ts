import { IsNumber } from 'class-validator';

export class SetMessageReadDto {
   @IsNumber()
   id: number;

   @IsNumber()
   userWhoReadId: number;

   @IsNumber()
   roomId: number;
}
