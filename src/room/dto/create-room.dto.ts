import {
   ArrayMinSize,
   IsArray,
   IsBoolean,
   IsNotEmpty,
   IsString,
   MaxLength,
} from 'class-validator';

export class CreateRoomDto {
   @IsArray()
   @ArrayMinSize(1)
   users: number[];

   @IsBoolean()
   isGroupChat: boolean;

   @IsString()
   @IsNotEmpty()
   @MaxLength(50)
   groupName: string;
}
