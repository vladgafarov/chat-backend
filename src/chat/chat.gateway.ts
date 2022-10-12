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

   handleConnection(socket: Socket) {
      console.log(socket.handshake.auth);
      console.log(`Client connected: ${socket.id}`);

      const { userId } = socket.handshake.auth;

      // if (userId) {
      //    this.chatService.updateUserOnlineStatus(userId, true);
      // }
   }

   handleDisconnect(socket: Socket) {
      console.log(socket.handshake.auth);
      console.log(`Client disconnected: ${socket.id}`);

      const { userId } = socket.handshake.auth;

      // if (userId) {
      //    this.chatService.updateUserOnlineStatus(userId, false);
      // }
   }
}
