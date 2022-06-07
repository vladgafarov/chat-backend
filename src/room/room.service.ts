import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { NOT_FOUND } from './room.constants';

@Injectable()
export class RoomService {
   constructor(private readonly prismaService: PrismaService) {}

   async createOne(userId: number, invitedUsers: Pick<User, 'id'>[]) {
      const parsedInvitedUsers: Array<{ id: number }> = invitedUsers.reduce(
         (acc, curr) => {
            return [...acc, { id: curr }];
         },
         [],
      );

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
   }

   async deleteOne(roomId: number) {
      const room = await this.prismaService.room.delete({
         where: { id: roomId },
      });

      if (!room) {
         throw new NotFoundException(NOT_FOUND);
      }

      return room;
   }
}
