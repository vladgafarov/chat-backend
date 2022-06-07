import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
   constructor(private readonly roomService: RoomService) {}

   @Post()
   @UseGuards(JwtAuthGuard)
   async create(@Body() dto: CreateRoomDto, @Req() req: Request) {
      console.log(req.user);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const userId = req.user.id;

      const room = await this.roomService.createOne(userId, dto.users);

      return room;
   }
}
