import {
   OnGatewayConnection,
   OnGatewayDisconnect,
   OnGatewayInit,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
   cors: {
      origin: '*',
   },
})
export class ChatGateway
   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
   constructor(private readonly chatService: ChatService) {}

   @WebSocketServer()
   server: Server;

   afterInit() {
      console.log('afterInit');
   }

   async handleConnection(socket: Socket) {
      console.log(socket.handshake.auth);
      console.log(`Client connected: ${socket.id}`);

      const { userId } = socket.handshake.auth;

      if (userId) {
         await this.chatService.updateUserOnlineStatus(userId, true);
      }
   }

   async handleDisconnect(socket: Socket) {
      console.log(socket.handshake.auth);
      console.log(`Client disconnected: ${socket.id}`);

      const { userId } = socket.handshake.auth;

      if (userId) {
         await this.chatService.updateUserOnlineStatus(userId, false);
      }
   }
}
