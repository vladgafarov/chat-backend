import {
   ConnectedSocket,
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomGateway } from 'src/room/room.gateway';
import { RoomService } from 'src/room/room.service';
import { AddMessageDto } from './dto/add-message.dto';
import { SetMessageReadDto } from './dto/set-message-red.dto';
import { MessageService } from './message.service';

@WebSocketGateway()
export class MessageGateway {
   constructor(
      private readonly messageService: MessageService,
      private readonly roomService: RoomService,
   ) {}

   @WebSocketServer()
   server: Server;

   @SubscribeMessage('CLIENT@MESSAGE:ADD')
   async addMessage(@MessageBody() dto: AddMessageDto) {
      const message = await this.messageService.addMessage(dto);

      const userIds = await this.messageService.getUserIdsFromRoom(dto.roomId);
      const onlineUsers = Object.entries(RoomGateway.socketRooms)
         .filter(([, value]) => userIds.includes(value.user.id))
         .map(async ([key, value]) => {
            return {
               socketId: key,
               userId: value.user.id,
               countUnreadMessages:
                  await this.roomService.countUnreadMessagesRoom(
                     dto.roomId,
                     value.user.id,
                  ),
            };
         });

      const onlineUsersAwaited = await Promise.all(onlineUsers);

      onlineUsersAwaited.forEach(async (item) => {
         const userRooms = await this.roomService.getAll(item.userId);

         this.server.to(item.socketId).emit('SERVER@UPDATE-SIDEBAR', {
            userRooms,
         });
      });
      this.server.in(`rooms/${dto.roomId}`).emit('SERVER@MESSAGE:ADD', message);
   }

   @SubscribeMessage('CLIENT@MESSAGE:READ')
   async setMessageRead(
      @MessageBody() dto: SetMessageReadDto,
      @ConnectedSocket() client: Socket,
   ) {
      const message = await this.messageService.setMessageRead(dto);
      const userRooms = await this.roomService.getAll(dto.userWhoReadId);

      client.emit('SERVER@UPDATE-SIDEBAR', {
         userRooms,
      });

      this.server
         .in(`rooms/${dto.roomId}`)
         .emit('SERVER@MESSAGE:READ', message);
   }

   @SubscribeMessage('CLIENT@MESSAGE:IS-TYPING')
   async isTyping(@MessageBody() { roomId, userId, name }) {
      this.server
         .in(`rooms/${roomId}`)
         .emit('SERVER@MESSAGE:IS-TYPING', { userId, name });
   }
}
