import { ArrayMinSize, IsArray } from 'class-validator';

export class CreateRoomDto {
   @IsArray()
   @ArrayMinSize(1)
   users: number[];
}
