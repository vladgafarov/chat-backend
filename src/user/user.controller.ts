import {
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
   @UseInterceptors(FileInterceptor('avatar'))
   async updateProfile(
      @Request() req,
      @UploadedFile() avatar: Express.Multer.File,
      @Body() data: UpdateDto,
   ) {
      let uploadedAvatarUrl: string | null = null;

      if (avatar) {
         uploadedAvatarUrl = (
            await this.filesService.upload([avatar], 'avatars')
         )[0].url;
      }

      const user = await this.userService.updateOne(req.user.id, {
         avatarUrl: uploadedAvatarUrl ?? data.avatarUrl,
         ...data,
      });

      return user;
   }
}
