import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Message, User } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma.service';
import { CANNOT_SET_OFFLINE, CANNOT_SET_ONLINE } from './chat.constants';

@Injectable()
export class ChatService {
   constructor(private readonly prismaService: PrismaService) {}

   getOnlineUsers(userId?: User['id']): Promise<User[]> {
      return this.prismaService.user.findMany({
         where: {
            online: true,
            id: {
               not: userId,
            },
         },
      });
   }

   getMessages(): Promise<Message[]> {
      return this.prismaService.message.findMany();
   }

   async updateUserOnlineStatus(
      userId: number,
      online: boolean,
   ): Promise<User> {
      try {
         console.log({ online, userId });

         return await this.prismaService.user.update({
            where: { id: userId },
            data: { online },
         });
      } catch (error) {
         if (error instanceof PrismaClientKnownRequestError) {
            throw new WsException(error.message);
         }
         console.log(error);
         throw new WsException(online ? CANNOT_SET_ONLINE : CANNOT_SET_OFFLINE);
      }
   }
}
