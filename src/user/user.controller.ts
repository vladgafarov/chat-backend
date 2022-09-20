import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { PrismaService } from 'src/prisma.service';

@Controller('user')
export class UserController {
   constructor(private readonly prismaService: PrismaService) {}

   @Get()
   @UseGuards(JwtAuthGuard)
   async findUsersByEmail(@Query('email') email: string, @Req() req) {
      const users = await this.prismaService.user.findMany({
         where: {
            AND: [
               {
                  email: {
                     contains: email,
                  },
               },
               {
                  id: {
                     not: req.user.id,
                  },
               },
            ],
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
