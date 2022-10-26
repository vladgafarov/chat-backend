import { IsNumber } from 'class-validator';

export class LeaveRoomDto {
   @IsNumber()
   id: number;
}
