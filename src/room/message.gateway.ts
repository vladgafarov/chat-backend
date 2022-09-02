import {
   ConnectedSocket,
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
   WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma.service';
import { AddMessageDto } from './dto/add-message.dto';
import { MESSAGE_ADD_ERROR } from './room.constants';

@WebSocketGateway()
export class MessageGateway {
   constructor(private readonly prismaService: PrismaService) {}

   @WebSocketServer()
   server: Server;

   @SubscribeMessage('CLIENT@MESSAGE:ADD')
   async addMessage(
      @MessageBody() { authorId, text, roomId }: AddMessageDto,
      @ConnectedSocket() client: Socket,
   ) {
      console.log('addMessage', { authorId, text, roomId });

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
                     name: true,
                     email: true,
                     avatarUrl: true,
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
