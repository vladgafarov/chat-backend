import {
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { RoomGateway } from 'src/room/room.gateway';
import { AddMessageDto } from './dto/add-message.dto';
import { SetMessageReadDto } from './dto/set-message-red.dto';
import { MessageService } from './message.service';

@WebSocketGateway()
export class MessageGateway {
   constructor(private readonly messageService: MessageService) {}

   @WebSocketServer()
   server: Server;

   @SubscribeMessage('CLIENT@MESSAGE:ADD')
   async addMessage(@MessageBody() dto: AddMessageDto) {
      const message = await this.messageService.addMessage(dto);

      const userIds = await this.messageService.getUserIdsFromRoom(dto.roomId);
      const onlineUsersSocketIds = Object.entries(RoomGateway.socketRooms)
         .filter(([, value]) => userIds.includes(value.user.id))
         .map(([key]) => key);

      this.server.to(onlineUsersSocketIds).emit('SERVER@MESSAGE:ADD-SIDEBAR', {
         message,
         roomId: dto.roomId,
      });
      this.server.in(`rooms/${dto.roomId}`).emit('SERVER@MESSAGE:ADD', message);
   }

   @SubscribeMessage('CLIENT@MESSAGE:READ')
   async setMessageRead(@MessageBody() dto: SetMessageReadDto) {
      const message = await this.messageService.setMessageRead(dto);

      this.server
         .in(`rooms/${dto.roomId}`)
         .emit('SERVER@MESSAGE:READ', message);
   }
}
