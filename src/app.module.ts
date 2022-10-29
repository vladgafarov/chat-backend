import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FilesModule } from './files/files.module';
import { MessageModule } from './message/message.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';

@Module({
   imports: [
      ChatModule,
      AuthModule,
      UserModule,
      ConfigModule.forRoot({
         isGlobal: true,
      }),
      RoomModule,
      MessageModule,
      FilesModule,
      EventEmitterModule.forRoot(),
   ],
   controllers: [AppController],
})
export class AppModule {}
