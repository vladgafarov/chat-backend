import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { MessageGateway } from './message.gateway';
import { MessageService } from './message.service';

@Module({
   providers: [MessageService, MessageGateway, PrismaService],
})
export class MessageModule {}
