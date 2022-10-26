import {
   Body,
   Controller,
   Get,
   Param,
   Post,
   Req,
   UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserPayload } from 'src/common/types/UserPayload';
import { CreateRoomDto } from './dto/create-room.dto';
import { LeaveRoomDto } from './dto/leave-room.dto';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
   constructor(private readonly roomService: RoomService) {}

   @Post()
   @UseGuards(JwtAuthGuard)
   async create(@Body() dto: CreateRoomDto, @Req() req: Request) {
      const userId = (req.user as UserPayload).id;

      const room = await this.roomService.createOne(
         userId,
         dto.users,
         dto.isGroupChat,
         dto.groupName,
      );

      return room;
   }

   @Post('leave')
   @UseGuards(JwtAuthGuard)
   async delete(@Body() dto: LeaveRoomDto, @Req() req: Request) {
      const userId = (req.user as UserPayload).id;

      const room = await this.roomService.leave(dto.id, userId);

      return room;
   }

   @Get()
   @UseGuards(JwtAuthGuard)
   async rooms(@Req() req: Request) {
      const userId = (req.user as UserPayload).id;

      return await this.roomService.getAll(userId);
   }

   @Get(':id')
   @UseGuards(JwtAuthGuard)
   async room(@Req() req: Request, @Param('id') id: string) {
      const userId = (req.user as UserPayload).id;

      return await this.roomService.getOne(userId, +id);
   }
}
