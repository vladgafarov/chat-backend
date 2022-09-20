import {
   ArrayMinSize,
   IsArray,
   IsBoolean,
   IsNotEmpty,
   IsString,
   MaxLength,
   ValidateIf,
} from 'class-validator';

export class CreateRoomDto {
   @IsArray()
   @ArrayMinSize(1)
   users: number[];

   @IsBoolean()
   isGroupChat: boolean;

   @ValidateIf((o) => o.isGroupChat)
   @IsString()
   @IsNotEmpty()
   @MaxLength(50)
   groupName: string;
}
