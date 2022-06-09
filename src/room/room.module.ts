import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { PrismaService } from 'src/prisma.service';
import { RoomGateway } from './room.gateway';
import { MessageGateway } from './message.gateway';

@Module({
   providers: [RoomService, PrismaService, RoomGateway, MessageGateway],
   controllers: [RoomController],
})
export class RoomModule {}
