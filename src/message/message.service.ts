import { Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma.service';
import { AddMessageDto } from './dto/add-message.dto';
import { SetMessageReadDto } from './dto/set-message-red.dto';
import { MESSAGE_ADD_ERROR } from './message.constants';

@Injectable()
export class MessageService {
   constructor(private readonly prismaService: PrismaService) {}

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

         const message = await this.prismaService.message.create({
            data: {
               text,
               author: {
                  connect: {
                     id: authorId,
                  },
               },
               room: {
                  connect: {
                     id: roomId,
                  },
               },
               unreadUsers: {
                  connect: otherUsers,
               },
            },
            include: {
               author: {
                  select: {
                     id: true,
                     name: true,
                     email: true,
                     avatarUrl: true,
                     online: true,
                  },
               },
            },
         });

         return message;
      } catch (error) {
         if (error instanceof PrismaClientKnownRequestError) {
            throw new WsException(error.message);
         }

         throw new WsException(MESSAGE_ADD_ERROR);
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
}
