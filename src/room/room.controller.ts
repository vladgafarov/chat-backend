import {
   Body,
   Controller,
   Delete,
   Get,
   Post,
   Req,
   UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserPayload } from 'src/common/types/UserPayload';
import { CreateRoomDto } from './dto/create-room.dto';
import { DeleteRoomDto } from './dto/delete-room.dto';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
   constructor(private readonly roomService: RoomService) {}

   @Post()
   @UseGuards(JwtAuthGuard)
   async create(@Body() dto: CreateRoomDto, @Req() req: Request) {
      const userId = (req.user as UserPayload).id;

      const room = await this.roomService.createOne(userId, dto.users);

      return room;
   }

   @Delete()
   @UseGuards(JwtAuthGuard)
   async delete(@Body() dto: DeleteRoomDto) {
      const count = await this.roomService.deleteOne(dto.ids);

      return count;
   }

   @Get()
   @UseGuards(JwtAuthGuard)
   async rooms(@Req() req: Request) {
      const userId = (req.user as UserPayload).id;

      return await this.roomService.getAll(userId);
   }
}
