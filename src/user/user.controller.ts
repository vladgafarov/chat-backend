import { Controller, Get, Query } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Controller('user')
export class UserController {
   constructor(private readonly prismaService: PrismaService) {}

   @Get()
   async findUsersByEmail(@Query('email') email: string) {
      const users = await this.prismaService.user.findMany({
         where: {
            email: {
               contains: email,
            },
         },
         select: {
            id: true,
            email: true,
            name: true,
            avatarUrl: true,
         },
      });

      return users;
   }
}
