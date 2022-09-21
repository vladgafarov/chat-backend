import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RoomController } from './room.controller';
import { RoomGateway } from './room.gateway';
import { RoomService } from './room.service';

@Module({
   providers: [RoomService, PrismaService, RoomGateway],
   controllers: [RoomController],
})
export class RoomModule {}
