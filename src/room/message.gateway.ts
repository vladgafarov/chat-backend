import {
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
   WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
import { AddMessageDto } from './dto/add-message.dto';
import { MESSAGE_ADD_ERROR } from './room.constants';

@WebSocketGateway()
export class MessageGateway {
   constructor(private readonly prismaService: PrismaService) {}

   @WebSocketServer()
   server: Server;

   @SubscribeMessage('CLIENT@MESSAGE:ADD')
   async addMessage(@MessageBody() { authorId, text, roomId }: AddMessageDto) {
      if (!text) {
         throw new WsException(MESSAGE_ADD_ERROR);
      }

      try {
         const message = await this.prismaService.message.create({
            data: {
               text,
               author: {
                  connect: {
                     id: authorId,
                  },
               },
               room: {
                  connect: {
                     id: roomId,
                  },
               },
            },
            include: {
               author: {
                  select: {
                     id: true,
                     name: true,
                     email: true,
                     avatarUrl: true,
                     online: true,
                  },
               },
            },
         });

         this.server.in(`rooms/${roomId}`).emit('SERVER@MESSAGE:ADD', message);
      } catch (error) {
         throw new WsException(MESSAGE_ADD_ERROR);
      }
   }
}
