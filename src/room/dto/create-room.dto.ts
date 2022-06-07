import { User } from '@prisma/client';
import { ArrayMinSize, IsArray } from 'class-validator';

export class CreateRoomDto {
   @IsArray()
   @ArrayMinSize(1)
   users: Pick<User, 'id'>[];
}
