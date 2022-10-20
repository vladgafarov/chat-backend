import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import { PrismaService } from 'src/prisma.service';
import { UpdateDto } from './dto/update.dto';
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

   async findOne(id: number): Promise<User> {
      return this.prismaSerivce.user.findUnique({
         where: { id },
      });
   }

   async updateOne(
      id: number,
      data: UpdateDto & { avatarUrl?: string },
   ): Promise<User> {
      // const user = await this.prismaSerivce.user.findUnique({
      //    where: { id },
      // })

      const user = await this.prismaSerivce.user.update({
         where: { id },
         data,
      });

      return user;
   }
}
