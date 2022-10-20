import {
   BadRequestException,
   Body,
   Controller,
   Get,
   Post,
   Query,
   Req,
   Request,
   UploadedFile,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { FilesService } from 'src/files/files.service';
import { PrismaService } from 'src/prisma.service';
import { AvatarThumbnail } from './dto/avatar-thumbnail';
import { UpdateDto } from './dto/update.dto';
import { INVALID_AVATAR_THUMBNAIL } from './user.constants';
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
   @UseInterceptors(FileInterceptor('avatar'))
   async updateProfile(
      @Request() req,
      @UploadedFile() uploadedAvatar: Express.Multer.File,
      @Body() data: UpdateDto,
   ): Promise<User> {
      if (uploadedAvatar) {
         const avatarThumbnail = JSON.parse(
            data.avatarThumbnail,
         ) as AvatarThumbnail;
         const { x, y, width, height } = avatarThumbnail;
         if (!width || !height || !x || !y) {
            throw new BadRequestException(INVALID_AVATAR_THUMBNAIL);
         }

         const [avatar] = await this.filesService.upload(
            [uploadedAvatar],
            'avatars',
         );

         const avatarThumbnailUrl = await this.userService.cropImage(
            avatarThumbnail,
            uploadedAvatar,
         );

         const user = await this.userService.updateOne(req.user.id, {
            ...data,
            avatarUrl: avatar.url,
            avatarThumbnailUrl,
            avatarThumbnail: data.avatarThumbnail,
         });

         return user;
      }

      const user = await this.userService.updateOne(req.user.id, data);

      return user;
   }
}
