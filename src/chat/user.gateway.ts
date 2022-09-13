import {
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets';
import { User } from '@prisma/client';
import { Server } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
   cors: {
      origin: '*',
   },
})
export class UserGateway {
   constructor(private readonly chatService: ChatService) {}

   @WebSocketServer()
   server: Server;

   @SubscribeMessage('CLIENT@USERS:GET')
   async getUsers(@MessageBody() user: User) {
      const users = await this.chatService.getOnlineUsers(user?.id);

      this.server.emit('SERVER@USERS:GET', users);

      return users;
   }
}
