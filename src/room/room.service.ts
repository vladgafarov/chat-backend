import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { Room } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import {
   CHAT_WITH_USER_EXISTS,
   INVALID_INVITED_USERS,
   INVALID_NOT_GROUP_CHAT,
   NOT_FOUND,
   USER_CANNOT_CHAT_HIMSELF,
} from './room.constants';

@Injectable()
export class RoomService {
   constructor(private readonly prismaService: PrismaService) {}

   async getOne(userId: number, roomId: number) {
      const room = await this.prismaService.room.findFirst({
         where: {
            id: roomId,
            OR: [
               {
                  authorId: userId,
               },
               {
                  invitedUsers: {
                     some: {
                        id: userId,
                     },
                  },
               },
            ],
         },
         include: {
            author: {
               select: {
                  id: true,
                  email: true,
                  name: true,
                  online: true,
                  avatarThumbnailUrl: true,
               },
            },
            invitedUsers: {
               select: {
                  id: true,
                  email: true,
                  name: true,
                  online: true,
                  avatarThumbnailUrl: true,
               },
            },
            messages: {
               select: {
                  id: true,
                  text: true,
                  createdAt: true,
                  isRead: true,
                  isEdited: true,
                  author: {
                     select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true,
                        avatarThumbnailUrl: true,
                        online: true,
                     },
                  },
                  unreadUsers: {
                     where: {
                        id: userId,
                     },
                     select: {
                        id: true,
                     },
                  },
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
                  files: {
                     select: {
                        id: true,
                        name: true,
                        url: true,
                        size: true,
                        mimetype: true,
                        createdAt: true,
                     },
                  },
               },
            },
         },
      });

      if (!room) {
         throw new NotFoundException(NOT_FOUND);
      }

      //add isRead to messages in room
      const messages = room.messages.map((message) => {
         const isReadByCurrentUser = message.unreadUsers.length === 0;

         return {
            ...message,
            isReadByCurrentUser,
         };
      });

      const title = !room.isGroupChat
         ? this.generateTitle({
              authorId: room.author.id,
              authorName: room.author.name,
              invitedUserName: room.invitedUsers[0]?.name,
              userId,
           })
         : room.title;

      return {
         ...room,
         messages,
         title,
         isCurrentUserAuthor: room?.author?.id === userId,
      };
   }

   async createOne(
      userId: number,
      invitedUsers: number[],
      isGroupChat: boolean,
      groupName: string,
   ) {
      if (invitedUsers.includes(userId)) {
         throw new BadRequestException(USER_CANNOT_CHAT_HIMSELF);
      }

      if (!isGroupChat && invitedUsers.length > 1) {
         throw new BadRequestException(INVALID_NOT_GROUP_CHAT);
      }

      if (!isGroupChat) {
         const chat = await this.prismaService.room.findFirst({
            where: {
               OR: [
                  {
                     authorId: userId,
                     invitedUsers: {
                        every: {
                           id: invitedUsers[0],
                        },
                     },
                  },
                  {
                     authorId: invitedUsers[0],
                     invitedUsers: {
                        every: {
                           id: userId,
                        },
                     },
                  },
               ],
            },
         });

         if (chat) {
            throw new BadRequestException(CHAT_WITH_USER_EXISTS);
         }
      }

      const parsedInvitedUsers: Array<{ id: number }> = invitedUsers.reduce(
         (acc, curr) => {
            return [...acc, { id: curr }];
         },
         [],
      );

      try {
         const room = await this.prismaService.room.create({
            data: {
               author: {
                  connect: {
                     id: userId,
                  },
               },
               invitedUsers: {
                  connect: parsedInvitedUsers,
               },
               title: !isGroupChat ? '' : groupName,
               isGroupChat,
            },
         });

         return room;
      } catch (error) {
         throw new BadRequestException(INVALID_INVITED_USERS);
      }
   }

   async leave(roomId: number, userId: number): Promise<Room> {
      try {
         const room = await this.prismaService.room.findFirst({
            where: {
               id: roomId,
            },
            include: {
               invitedUsers: true,
            },
         });

         if (!room) {
            throw new NotFoundException(NOT_FOUND);
         }

         const isUserInRoom =
            room?.invitedUsers.some((user) => user.id === userId) ||
            room?.authorId === userId;

         if (!isUserInRoom) {
            throw new NotFoundException(NOT_FOUND);
         }

         const isUserAuthor = room.authorId === userId;
         const isGroupChat = room.isGroupChat;

         if (isGroupChat) {
            const updatedRoom = await this.prismaService.room.update({
               where: {
                  id: roomId,
               },
               data: {
                  author: {
                     disconnect: isUserAuthor ? true : undefined,
                  },
                  invitedUsers: {
                     disconnect: {
                        id: userId,
                     },
                  },
               },
            });

            return updatedRoom;
         }

         const deletedRoom = await this.prismaService.room.delete({
            where: {
               id: roomId,
            },
         });

         return deletedRoom;
      } catch (error) {
         throw new BadRequestException(error.message);
      }
   }

   async getAll(userId: number) {
      const rooms = await this.prismaService.room.findMany({
         where: {
            OR: [
               {
                  authorId: userId,
               },
               {
                  invitedUsers: {
                     some: {
                        id: userId,
                     },
                  },
               },
            ],
         },
         orderBy: {
            updatedAt: 'desc',
         },
         include: {
            author: {
               select: {
                  id: true,
                  email: true,
                  name: true,
                  online: true,
                  avatarThumbnailUrl: true,
               },
            },
            invitedUsers: {
               select: {
                  avatarUrl: true,
                  id: true,
                  name: true,
                  email: true,
                  online: true,
                  avatarThumbnailUrl: true,
               },
            },
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
                     },
                  },
               },
            },
         },
      });

      const roomsWithCustomFields = rooms.map(async (room) => {
         const countUnreadMessages = await this.countUnreadMessagesRoom(
            room.id,
            userId,
         );

         const isCurrentUserAuthor = room?.author?.id === userId;

         if (!room.isGroupChat) {
            const image = isCurrentUserAuthor
               ? room.invitedUsers[0]?.avatarThumbnailUrl
               : room.author.avatarThumbnailUrl;
            const title = this.generateTitle({
               authorId: room.author.id,
               authorName: room.author.name,
               invitedUserName: room.invitedUsers[0]?.name,
               userId,
            });

            return {
               ...room,
               countUnreadMessages,
               title,
               isCurrentUserAuthor,
               image,
            };
         }

         return {
            ...room,
            countUnreadMessages,
            title: room.title,
            isCurrentUserAuthor,
         };
      });

      return await Promise.all(roomsWithCustomFields);
   }

   // async updateOne(roomId: number, userId: number, title: string) {}

   generateTitle({
      authorId,
      authorName,
      invitedUserName,
      userId,
   }: {
      authorId: number;
      authorName: string;
      userId: number;
      invitedUserName: string;
   }): string {
      const isUserAuthor = authorId === userId;

      if (isUserAuthor) {
         return invitedUserName;
      }

      return authorName;
   }

   async countUnreadMessagesRoom(roomId: number, userId: number) {
      const unreadMessagesCount = await this.prismaService.message.count({
         where: {
            roomId,
            unreadUsers: {
               some: {
                  id: userId,
               },
            },
         },
      });

      return unreadMessagesCount;
   }
}
