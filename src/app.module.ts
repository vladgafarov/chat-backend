import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { RoomModule } from './room/room.module';

@Module({
   imports: [
      ChatModule,
      AuthModule,
      UserModule,
      ConfigModule.forRoot({
         isGlobal: true,
      }),
      RoomModule,
   ],
   controllers: [AppController],
})
export class AppModule {}
