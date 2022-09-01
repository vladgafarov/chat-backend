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
   }

   // @SubscribeMessage('CLIENT@USER:CONNECTED')
   // async userOnline(@MessageBody() user: User ) {
   //    const user = await this.chatService.;

   //    this.server.emit('SERVER@USERS:GET', users);
   // }

   // @SubscribeMessage('user:add')
   // async addUser(
   //    @MessageBody() { email, name }: Pick<User, 'name' | 'email'>,
   // ): Promise<User[]> {
   //    console.log('addUser: ', { email, name });
   //    const users = await this.chatService.addUser({ email, name });

   //    return users;
   // }

   // @SubscribeMessage('users:get')
   // async getUsers() {
   //    const users = await this.chatService.getUsers();

   //    this.server.emit('user:add', users);
   // }
}
