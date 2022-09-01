import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
   INVALID_INVITED_USERS,
   NOT_FOUND,
   USER_CANNOT_CHAT_HIMSELF,
} from './room.constants';
import { RoomGateway } from './room.gateway';

@Injectable()
export class RoomService {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly roomGateway: RoomGateway,
   ) {}

   async createOne(userId: number, invitedUsers: number[]) {
      if (invitedUsers.includes(userId)) {
         throw new BadRequestException(USER_CANNOT_CHAT_HIMSELF);
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
               users: {
                  connect: [{ id: userId }, ...parsedInvitedUsers],
               },
            },
            include: {
               users: {
                  select: {
                     id: true,
                     avatarUrl: true,
                     email: true,
                     name: true,
                     online: true,
                  },
               },
            },
         });

         return room;
      } catch (error) {
         throw new BadRequestException(INVALID_INVITED_USERS);
      }
   }

   async deleteMany(roomIds: number[]) {
      try {
         const deletedRoomsCount = await this.prismaService.room.deleteMany({
            where: {
               id: {
                  in: roomIds,
               },
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
         where: { users: { some: { id: userId } } },
         include: {
            users: {
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
