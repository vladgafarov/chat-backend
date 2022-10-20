import {
   Body,
   Controller,
   Get,
   Post,
   Query,
   Req,
   Request,
   UploadedFile,
   UploadedFiles,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';
import {
   FileFieldsInterceptor,
   FileInterceptor,
} from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilesService } from 'src/files/files.service';
import { PrismaService } from 'src/prisma.service';
import { UpdateDto } from './dto/update.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
   constructor(
      private readonly prismaService: PrismaService,
      private readonly userService: UserService,
      private readonly filesService: FilesService,
   ) {}

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

   @UseGuards(JwtAuthGuard)
   @Get('profile')
   async getProfile(@Request() req) {
      const user = await this.userService.findOne(req.user.id);

      return user;
   }

   @UseGuards(JwtAuthGuard)
   @Post('update')
   @UseInterceptors(
      FileFieldsInterceptor([
         { name: 'avatar', maxCount: 1 },
         { name: 'avatarThumbnail', maxCount: 1 },
      ]),
   )
   async updateProfile(
      @Request() req,
      @UploadedFiles()
      files: {
         avatar?: Express.Multer.File;
         avatarThumbnail?: Express.Multer.File;
      },
      @Body() data: UpdateDto,
   ): Promise<User> {
      if (files.avatar && files.avatarThumbnail) {
         const [avatar, thumbnailAvatar] = await this.filesService.upload(
            [files.avatar],
            'avatars',
         );

         const user = await this.userService.updateOne(req.user.id, {
            ...data,
            avatarUrl: avatar.url,
            avatarThumbnailUrl: thumbnailAvatar.url,
            avatarThumbnail: data.avatarThumbnail,
         });

         return user;
      }

      const user = await this.userService.updateOne(req.user.id, data);

      return user;
   }
}
