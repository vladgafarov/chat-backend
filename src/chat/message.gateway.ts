import {
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
   ConnectedSocket,
} from '@nestjs/websockets';
import { Message } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
   cors: {
      origin: '*',
   },
})
export class MessageGateway {
   constructor(private readonly chatService: ChatService) {}

   @WebSocketServer()
   server: Server;

   @SubscribeMessage('messages:get')
   async getMessages(@ConnectedSocket() socket: Socket) {
      const messages = await this.chatService.getMessages();

      return messages;
   }

   async emitGetMessages(roomId: string) {
      const messages = await this.chatService.getMessages();

      this.server.in(roomId).emit('messages:get', messages);
   }
}
