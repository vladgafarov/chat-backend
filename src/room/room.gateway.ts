import {
   ConnectedSocket,
   MessageBody,
   OnGatewayConnection,
   OnGatewayDisconnect,
   OnGatewayInit,
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class RoomGateway
   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
   @WebSocketServer()
   server: Server;

   @SubscribeMessage('CLIENT@ROOMS:JOIN')
   handleRoomJoin(
      @MessageBody() data: string,
      @ConnectedSocket() client: Socket,
   ) {
      return 'Hello world!';
   }

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
