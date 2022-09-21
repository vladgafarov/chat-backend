import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { UserGateway } from './user.gateway';

@Module({
   providers: [ChatGateway, UserGateway, ChatService, PrismaService],
})
export class ChatModule {}
