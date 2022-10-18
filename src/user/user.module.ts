import { Module } from '@nestjs/common';
import { FilesModule } from 'src/files/files.module';
import { PrismaService } from 'src/prisma.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
   providers: [UserService, PrismaService],
   exports: [UserService],
   controllers: [UserController],
   imports: [FilesModule],
})
export class UserModule {}
