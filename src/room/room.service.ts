import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
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
                  email: true,
                  name: true,
                  online: true,
               },
            },
            invitedUsers: {
               select: {
                  id: true,
                  avatarUrl: true,
                  email: true,
                  name: true,
                  online: true,
               },
            },
            messages: true,
         },
      });

      if (!room) {
         throw new NotFoundException(NOT_FOUND);
      }

      return room;
   }

   async createOne(
      userId: number,
      invitedUsers: number[],
      isGroupChat: boolean,
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
               title: !isGroupChat ? '' : 'fill me please',
               isGroupChat,
            },
         });

         return room;
      } catch (error) {
         throw new BadRequestException(INVALID_INVITED_USERS);
      }
   }

   async deleteMany(roomIds: number[], userId: number) {
      try {
         const deletedRoomsCount = await this.prismaService.room.deleteMany({
            where: {
               AND: [
                  {
                     id: {
                        in: roomIds,
                     },
                  },
                  { authorId: userId },
               ],
            },
         });

         if (!deletedRoomsCount) {
            throw new NotFoundException(NOT_FOUND);
         }

         return deletedRoomsCount;
      } catch (error) {
         throw new NotFoundException(NOT_FOUND);
      }
   }

   async getAll(userId: number) {
      return await this.prismaService.room.findMany({
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
         include: {
            author: {
               select: {
                  email: true,
                  name: true,
                  online: true,
               },
            },
            invitedUsers: {
               select: {
                  avatarUrl: true,
                  id: true,
                  name: true,
                  email: true,
                  online: true,
               },
            },
         },
      });
   }
}
