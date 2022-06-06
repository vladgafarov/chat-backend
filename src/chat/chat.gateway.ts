import {
   OnGatewayConnection,
   OnGatewayDisconnect,
   OnGatewayInit,
   WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
   cors: {
      origin: '*',
   },
})
export class ChatGateway
   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
   afterInit(server: Server) {
      console.log('afterInit');
   }

   handleDisconnect(socket: Socket) {
      socket.leave(socket.handshake.query.roomId as string);
      console.log(`Client disconnected: ${socket.id}`);
   }

   handleConnection(socket: Socket) {
      socket.join(socket.handshake.query.roomId);
      console.log(socket.rooms);
      console.log(`Client connected: ${socket.id}`);
   }
}
