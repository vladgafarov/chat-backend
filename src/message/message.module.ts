import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { RoomModule } from 'src/room/room.module';
import { RoomService } from 'src/room/room.service';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';

@Module({
   imports: [RoomModule],
   providers: [MessageService, MessageGateway, PrismaService, RoomService],
})
export class MessageModule {}
