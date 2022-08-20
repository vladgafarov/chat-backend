import { Injectable } from '@nestjs/common';
import { Message, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
   constructor(private readonly prismaService: PrismaService) {}

   getUsers(): Promise<User[]> {
      return this.prismaService.user.findMany({
         where: {
            online: true,
         },
      });
   }

   getMessages(): Promise<Message[]> {
      return this.prismaService.message.findMany();
   }

   setUserOnline(userId: number): Promise<User> {
      return this.prismaService.user.update({
         where: {
            id: userId,
         },
         data: {
            online: true,
         },
      });
   }

   setUserOffline(userId: number): Promise<User> {
      return this.prismaService.user.update({
         where: {
            id: userId,
         },
         data: {
            online: false,
         },
      });
   }
}
