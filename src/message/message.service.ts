import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma.service';
import { RoomGateway } from 'src/room/room.gateway';
import { RoomService } from 'src/room/room.service';
import { AddMessageDto } from './dto/add-message.dto';
import { SetMessageReadDto } from './dto/set-message-red.dto';
import { MESSAGE_ADD_ERROR } from './message.constants';

@Injectable()
export class MessageService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly roomService: RoomService,
   ) {}

   async addMessage({ authorId, roomId, text }: AddMessageDto) {
      if (!text) {
         throw new WsException(MESSAGE_ADD_ERROR);
      }

      try {
         const room = await this.prismaService.room.findUnique({
            where: { id: roomId },
            select: {
               id: true,
               authorId: true,
               invitedUsers: {
                  select: {
                     id: true,
                  },
               },
            },
         });

         const otherUsers = [
            ...room.invitedUsers.map((u) => u.id),
            room.authorId,
         ]
            .filter((u) => u !== authorId)
            .map((u) => ({ id: u }));

         const roomWithLastMessage = await this.prismaService.room.update({
            where: { id: roomId },
            data: {
               updatedAt: new Date(),
               messages: {
                  create: {
                     text,
                     author: {
                        connect: {
                           id: authorId,
                        },
                     },
                     unreadUsers: {
                        connect: otherUsers,
                     },
                  },
               },
            },
            include: {
               messages: {
                  take: 1,
                  orderBy: {
                     createdAt: 'desc',
                  },
                  select: {
                     id: true,
                     text: true,
                     createdAt: true,
                     author: {
                        select: {
                           id: true,
                           name: true,
                           email: true,
                           avatarUrl: true,
                        },
                     },
                  },
               },
            },
         });

         return roomWithLastMessage.messages[0];
      } catch (error) {
         if (error instanceof PrismaClientKnownRequestError) {
            throw new WsException(error.message);
         }

         throw new WsException(MESSAGE_ADD_ERROR);
      }
   }

   async updateMessage(messageId: number, text: string) {
      try {
         const message = await this.prismaService.message.update({
            where: { id: messageId },
            data: {
               text,
               isEdited: true,
            },
         });

         return message;
      } catch (error) {
         if (error instanceof PrismaClientKnownRequestError) {
            throw new WsException(error.message);
         }

         throw new WsException(error);
      }
   }

   async deleteMessage(messageId: number) {
      try {
         const message = await this.prismaService.message.delete({
            where: { id: messageId },
            select: {
               id: true,
            },
         });

         return message.id;
      } catch (error) {
         if (error instanceof PrismaClientKnownRequestError) {
            throw new WsException(error.message);
         }

         throw new WsException(error);
      }
   }

   async setMessageRead({ id, userWhoReadId }: SetMessageReadDto) {
      try {
         const message = await this.prismaService.message.update({
            where: { id },
            data: {
               unreadUsers: {
                  disconnect: {
                     id: userWhoReadId,
                  },
               },
               isRead: true,
            },
         });

         return message;
      } catch (error) {
         if (error instanceof PrismaClientKnownRequestError) {
            throw new WsException(error.message);
         }

         throw new WsException(error);
      }
   }

   async getUserIdsFromRoom(roomId: number) {
      const room = await this.prismaService.room.findUnique({
         where: { id: roomId },
         select: {
            authorId: true,
            invitedUsers: {
               select: {
                  id: true,
               },
            },
         },
      });

      return [...room.invitedUsers.map((u) => u.id), room.authorId];
   }

   async getOnlineUsersFromRoom(roomId: number) {
      const userIds = await this.getUserIdsFromRoom(roomId);
      const onlineUsers = Object.entries(RoomGateway.socketRooms)
         .filter(([, value]) => userIds.includes(value.user.id))
         .map(async ([key, value]) => {
            return {
               socketId: key,
               userId: value.user.id,
               countUnreadMessages:
                  await this.roomService.countUnreadMessagesRoom(
                     roomId,
                     value.user.id,
                  ),
            };
         });

      const onlineUsersAwaited = await Promise.all(onlineUsers);

      return onlineUsersAwaited;
   }
}
