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
import { PrismaService } from 'src/prisma.service';
import { JoinRoomDto } from './dto/join-room.dto';
import { CallRooms } from './types/CallRooms';
import { SocketRooms } from './types/SocketRooms';

@WebSocketGateway()
export class RoomGateway
   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
   constructor(private readonly prismaService: PrismaService) {}

   @WebSocketServer()
   server: Server;

   public static socketRooms: SocketRooms = {};
   public static callRooms: CallRooms = {};

   @SubscribeMessage('CLIENT@ROOM:JOIN')
   joinRoom(
      @MessageBody() { roomId, user }: JoinRoomDto,
      @ConnectedSocket() socket: Socket,
   ) {
      const room = `rooms/${roomId}`;

      socket.join(room);

      RoomGateway.socketRooms[socket.id] = { roomId, user };

      this.server.in(room).emit('SERVER@ROOM:JOIN', { user, roomId });
   }

   @SubscribeMessage('CLIENT@ROOM:CALL:JOIN')
   async call(@MessageBody() { roomId, userId }) {
      const { id, name, avatarThumbnailUrl } =
         await this.prismaService.user.findUnique({
            where: { id: userId },
         });

      const user = { id, name, avatarThumbnailUrl };

      if (RoomGateway.callRooms[roomId]) {
         const userInRoom = RoomGateway.callRooms[roomId].find(
            (user) => user.id === userId,
         );

         if (!userInRoom) {
            RoomGateway.callRooms[roomId].push(user);
         }
      } else {
         RoomGateway.callRooms[roomId] = [user];
      }

      this.server
         .in(`rooms/${roomId}`)
         .emit('SERVER@ROOM:CALL:JOIN', RoomGateway.callRooms[roomId]);
   }

   @SubscribeMessage('CLIENT@ROOM:CALL')
   callUser(
      @MessageBody() { targetUserId, callerUserId, roomId, signal },
      @ConnectedSocket() socket: Socket,
   ) {
      socket.broadcast
         .to(`rooms/${roomId}`)
         .emit('SERVER@ROOM:CALL', { signal, targetUserId, callerUserId });
   }

   @SubscribeMessage('CLIENT@ROOM:CALL:ANSWER')
   answer(
      @MessageBody() { targetUserId, callerUserId, roomId, signal },
      @ConnectedSocket() socket: Socket,
   ) {
      socket.broadcast.to(`rooms/${roomId}`).emit('SERVER@ROOM:CALL:ANSWER', {
         signal,
         targetUserId,
         callerUserId,
      });
   }

   @SubscribeMessage('CLIENT@ROOM:CALL:LEAVE')
   leaveCall(@MessageBody() { roomId, userId }) {
      RoomGateway.callRooms[roomId] = RoomGateway.callRooms[roomId].filter(
         (user) => user.id !== userId,
      );

      this.server
         .in(`rooms/${roomId}`)
         .emit('SERVER@ROOM:CALL:LEAVE', RoomGateway.callRooms[roomId]);
   }

   @SubscribeMessage('CLIENT@ROOM:LEAVE')
   leaveRoom(
      @MessageBody() { roomId, user }: JoinRoomDto,
      @ConnectedSocket() socket: Socket,
   ) {
      console.log(`user ${user.email} left room ${roomId}`);
      socket.leave(`rooms/${roomId}`);
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
