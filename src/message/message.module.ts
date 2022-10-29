import { Module } from '@nestjs/common';
import { FilesModule } from 'src/files/files.module';
import { FilesService } from 'src/files/files.service';
import { PrismaService } from 'src/prisma.service';
import { RoomModule } from 'src/room/room.module';
import { RoomService } from 'src/room/room.service';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';

@Module({
   imports: [RoomModule, FilesModule],
   providers: [
      MessageService,
      MessageGateway,
      PrismaService,
      RoomService,
      FilesService,
   ],
   controllers: [MessageController],
})
export class MessageModule {}
