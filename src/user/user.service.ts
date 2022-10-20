import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import { FilesService } from 'src/files/files.service';
import { PrismaService } from 'src/prisma.service';
import { AvatarThumbnail } from './dto/avatar-thumbnail';
import { UpdateDto } from './dto/update.dto';
import { ALREADY_EXIST } from './user.constants';

@Injectable()
export class UserService {
   constructor(
      private readonly prismaSerivce: PrismaService,
      private readonly filesService: FilesService,
   ) {}

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
      const user = await this.prismaSerivce.user.update({
         where: { id },
         data,
      });

      return user;
   }

   async cropImage(
      data: AvatarThumbnail,
      image: Express.Multer.File,
   ): Promise<string> {
      const cropedImage = await this.filesService.cropImage(image.buffer, data);
      const resizedImage = await this.filesService.resizeImage(
         cropedImage,
         96,
         96,
      );

      const uploadFolder = `${path}/uploads/avatars`;
      await ensureDir(uploadFolder);
      const fileName = `${Date.now()}-${image.originalname.split('.')[0]}.webp`;
      await writeFile(`${uploadFolder}/${fileName}`, resizedImage);

      return `http://localhost:3000/static/avatars/${fileName}`;
   }
}
