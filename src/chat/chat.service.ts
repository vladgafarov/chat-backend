import { Injectable } from '@nestjs/common';
import { Message, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ChatService {
   constructor(private readonly prismaService: PrismaService) {}

   // async addUser({
   //    email,
   //    name,
   // }: Pick<User, 'email' | 'name'>): Promise<User[]> {
   //    const user = await this.prismaService.user.findUnique({
   //       where: {
   //          email,
   //       },
   //    });

   //    if (user) {
   //       await this.prismaService.user.update({
   //          where: { email },
   //          data: {
   //             online: true,
   //          },
   //       });
   //    } else {
   //       await this.prismaService.user.create({
   //          data: {
   //             name,
   //             email,
   //             online: true,
   //          },
   //       });
   //    }

   //    return this.getUsers();
   // }

   getUsers(): Promise<User[]> {
      return this.prismaService.user.findMany();
   }

   // async addMessage({
   //    text,
   //    authorId,
   // }: Pick<Message, 'text' | 'authorId'>): Promise<Message[]> {
   //    await this.prismaService.message.create({
   //       data: {
   //          text,
   //          authorId,
   //       },
   //    });

   //    return this.getMessages();
   // }

   getMessages(): Promise<Message[]> {
      return this.prismaService.message.findMany();
   }
}
