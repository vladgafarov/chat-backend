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
   @WebSocketServer()
   server: Server;

   constructor(private readonly chatService: ChatService) {}

   afterInit(server: Server) {
      console.log('afterInit');
   }

   async handleConnection(socket: Socket) {
      console.log(socket.handshake.auth);
      console.log(`Client connected: ${socket.id}`);

      if (socket.handshake.auth.userId) {
         await this.chatService.setUserOnline(socket.handshake.auth.userId);

         const users = await this.chatService.getUsers();
         this.server.emit('SERVER@USERS:GET', users);
      }
   }

   async handleDisconnect(socket: Socket) {
      console.log(socket.handshake.auth);
      console.log(`Client disconnected: ${socket.id}`);

      if (socket.handshake.auth.userId) {
         await this.chatService.setUserOffline(socket.handshake.auth.userId);

         const users = await this.chatService.getUsers();
         this.server.emit('SERVER@USERS:GET', users);
      }
   }
}
