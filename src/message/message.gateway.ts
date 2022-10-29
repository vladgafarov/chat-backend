import {
   ConnectedSocket,
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomService } from 'src/room/room.service';
import { DeleteMessageDto } from './dto/delete-message.dto';
import { ForwardMessageDto } from './dto/forward-message.dto';
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

   // @SubscribeMessage('CLIENT@MESSAGE:ADD')
   // async addMessage(@MessageBody() dto: AddMessageDto | ReplyMessageDto) {
   //    const message = await this.messageService.addMessage(2, dto);

   //    await this.updateSidebar(dto.roomId);

   //    this.server.in(`rooms/${dto.roomId}`).emit('SERVER@MESSAGE:ADD', message);
   // }

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
   async deleteMessage(
      @MessageBody() { roomId, messageIds }: DeleteMessageDto,
   ) {
      await this.messageService.deleteMessage(messageIds);

      await this.updateSidebar(roomId);

      this.server
         .in(`rooms/${roomId}`)
         .emit('SERVER@MESSAGE:DELETE', messageIds);
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

   @SubscribeMessage('CLIENT@MESSAGE:FORWARD')
   async forwardMessage(@MessageBody() dto: ForwardMessageDto) {
      const message = await this.messageService.forwardMessage(dto);

      await this.updateSidebar(dto.roomId);

      dto.roomIds.forEach((id) => {
         this.server.in(`rooms/${id}`).emit('SERVER@MESSAGE:ADD', message);
      });
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
