import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma.service';
import { RoomGateway } from 'src/room/room.gateway';
import { RoomService } from 'src/room/room.service';
import { AddMessageDto } from './dto/add-message.dto';
import { ForwardMessageDto } from './dto/forward-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { SetMessageReadDto } from './dto/set-message-red.dto';
import { MESSAGE_ADD_ERROR } from './message.constants';

@Injectable()
export class MessageService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly roomService: RoomService,
   ) {}

   async addMessage({
      authorId,
      roomId,
      text,
      repliedMessageId,
   }: AddMessageDto & ReplyMessageDto) {
      if (!text) {
         throw new WsException(MESSAGE_ADD_ERROR);
      }

      try {
         const otherUsers = await this.getOtherUsersFromRoom(roomId, authorId);

         const roomWithLastMessage = await this.prismaService.room.update({
            where: { id: roomId },
            data: {
               updatedAt: new Date(),
               messages: {
                  create: {
                     text,
                     authorId,
                     unreadUsers: {
                        connect: otherUsers,
                     },
                     replyToId: repliedMessageId,
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
                     replyTo: {
                        select: {
                           id: true,
                           text: true,
                           author: {
                              select: {
                                 id: true,
                                 name: true,
                              },
                           },
                        },
                     },
                     author: {
                        select: {
                           id: true,
                           name: true,
                           email: true,
                           avatarUrl: true,
                        },
                     },
                     isForwarded: true,
                     forwardedMessages: {
                        select: {
                           id: true,
                           text: true,
                           createdAt: true,
                           author: {
                              select: {
                                 id: true,
                                 name: true,
                              },
                           },
                           replyTo: {
                              select: {
                                 id: true,
                                 text: true,
                                 createdAt: true,
                                 author: {
                                    select: {
                                       id: true,
                                       name: true,
                                    },
                                 },
                              },
                           },
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

   async deleteMessage(messageIds: number[]) {
      try {
         const count = await this.prismaService.message.deleteMany({
            where: {
               id: {
                  in: messageIds,
               },
            },
         });

         return count;
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

   async forwardMessage({
      messageIds,
      roomIds,
      text,
      userId,
   }: ForwardMessageDto) {
      try {
         const messages = await Promise.all(
            roomIds.map(async (roomId) => {
               const otherUsers = await this.getOtherUsersFromRoom(
                  roomId,
                  userId,
               );

               const room = await this.prismaService.room.update({
                  where: { id: roomId },
                  data: {
                     updatedAt: new Date(),
                     messages: {
                        create: {
                           text,
                           authorId: userId,
                           unreadUsers: {
                              connect: otherUsers,
                           },
                           isForwarded: true,
                           forwardedMessages: {
                              connect: messageIds.map((id) => ({ id })),
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
                           replyTo: {
                              select: {
                                 id: true,
                                 text: true,
                                 author: {
                                    select: {
                                       id: true,
                                       name: true,
                                    },
                                 },
                              },
                           },
                           author: {
                              select: {
                                 id: true,
                                 name: true,
                                 email: true,
                                 avatarUrl: true,
                              },
                           },
                           isForwarded: true,
                           forwardedMessages: {
                              select: {
                                 id: true,
                                 text: true,
                                 createdAt: true,
                                 author: {
                                    select: {
                                       id: true,
                                       name: true,
                                    },
                                 },
                                 replyTo: {
                                    select: {
                                       id: true,
                                       text: true,
                                       createdAt: true,
                                       author: {
                                          select: {
                                             id: true,
                                             name: true,
                                          },
                                       },
                                    },
                                 },
                              },
                           },
                        },
                     },
                  },
               });

               return room.messages[0];
            }),
         );

         return messages[0];
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

   async getOtherUsersFromRoom(roomId: number, userId: number) {
      const userIds = await this.getUserIdsFromRoom(roomId);
      const otherUsers = userIds.filter((id) => id !== userId);

      return otherUsers.map((id) => ({ id }));
   }
}
