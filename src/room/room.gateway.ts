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
import { JoinRoomDto } from './dto/join-room.dto';
import { SocketRooms } from './types/SocketRooms';

@WebSocketGateway()
export class RoomGateway
   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
   @WebSocketServer()
   server: Server;

   static socketRooms: SocketRooms = {};

   @SubscribeMessage('CLIENT@ROOM:JOIN')
   joinRoom(
      @MessageBody() { roomId, user }: JoinRoomDto,
      @ConnectedSocket() socket: Socket,
   ) {
      const room = `rooms/${roomId}`;

      socket.join(room);

      RoomGateway.socketRooms[socket.id] = { roomId, user };

      //emit to all users in room
      this.server.in(room).emit('SERVER@ROOM:JOIN', user);
   }

   afterInit(server: Server) {
      console.log('afterInit');
   }

   handleDisconnect(socket: Socket) {
      console.log(`Client disconnected: ${socket.id}`);
      delete RoomGateway.socketRooms[socket.id];
   }

   handleConnection(socket: Socket) {
      console.log(`Client connected: ${socket.id}`);
   }
}
