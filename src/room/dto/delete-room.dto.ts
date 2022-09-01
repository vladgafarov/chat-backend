import { IsArray } from 'class-validator';

export class DeleteRoomDto {
   @IsArray()
   ids: number[];
}
