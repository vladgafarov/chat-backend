import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import { PrismaService } from 'src/prisma.service';
import { ALREADY_EXIST } from './user.constants';

@Injectable()
export class UserService {
   constructor(private readonly prismaSerivce: PrismaService) {}

   async createOne({ email, name, password }: SignUpDto) {
      const user = await this.prismaSerivce.user.findUnique({
         where: { email },
      });

      if (user) {
         throw new BadRequestException(ALREADY_EXIST);
      }

      const createdUser = await this.prismaSerivce.user.create({
         data: {
            name,
            email,
            password,
         },
      });

      return createdUser;
   }

   async findOne(id: number): Promise<Omit<User, 'password'>> {
      return this.prismaSerivce.user.findUnique({
         where: { id },
         select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
            online: true,
            password: false,
         },
      });
   }
}
