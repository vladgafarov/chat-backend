import { User } from '@prisma/client';
import { IsNumber } from 'class-validator';

export class JoinRoomDto {
   @IsNumber()
   roomId: number;

   user: Pick<User, 'id' | 'name' | 'email'>;
}
