import {
   ConnectedSocket,
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from 'src/room/room.service';
import { AddMessageDto } from './dto/add-message.dto';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { SetMessageReadDto } from './dto/set-message-red.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
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
   async addMessage(@MessageBody() dto: AddMessageDto | ReplyMessageDto) {
      const message = await this.messageService.addMessage(dto);

      await this.updateSidebar(dto.roomId);

      this.server.in(`rooms/${dto.roomId}`).emit('SERVER@MESSAGE:ADD', message);
   }

   @SubscribeMessage('CLIENT@MESSAGE:UPDATE')
   async updateMessage(
      @MessageBody() { roomId, messageId, text }: UpdateMessageDto,
   ) {
      const updatedMessage = await this.messageService.updateMessage(
         messageId,
         text,
      );

      await this.updateSidebar(roomId);

      this.server
         .in(`rooms/${roomId}`)
         .emit('SERVER@MESSAGE:UPDATE', updatedMessage);
   }

   @SubscribeMessage('CLIENT@MESSAGE:DELETE')
   async deleteMessage(@MessageBody() { roomId, messageId }: DeleteMessageDto) {
      await this.messageService.deleteMessage(messageId);

      await this.updateSidebar(roomId);

      this.server
         .in(`rooms/${roomId}`)
         .emit('SERVER@MESSAGE:DELETE', messageId);
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

   async updateSidebar(roomId: number) {
      const onlineUsers = await this.messageService.getOnlineUsersFromRoom(
         roomId,
      );

      onlineUsers.forEach(async (item) => {
         const userRooms = await this.roomService.getAll(item.userId);

         this.server.to(item.socketId).emit('SERVER@UPDATE-SIDEBAR', {
            userRooms,
         });
      });
   }
}
