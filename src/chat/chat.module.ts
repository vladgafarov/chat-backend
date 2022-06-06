import { Module } from '@nestjs/common';
import { MessageGateway } from './message.gateway';
import { ChatGateway } from './chat.gateway';
import { UserGateway } from './user.gateway';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma.service';

@Module({
   providers: [
      ChatGateway,
      MessageGateway,
      UserGateway,
      ChatService,
      PrismaService,
   ],
})
export class ChatModule {}
