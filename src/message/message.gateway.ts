import {
   MessageBody,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
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
