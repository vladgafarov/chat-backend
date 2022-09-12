import { ArrayMinSize, IsArray, IsBoolean } from 'class-validator';

export class CreateRoomDto {
   @IsArray()
   @ArrayMinSize(1)
   users: number[];

   @IsBoolean()
   isGroupChat: boolean;
}
