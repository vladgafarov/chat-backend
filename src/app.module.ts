import { Module } from '@nestjs/common';
import { ChatModule } from './chat/chat.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app/app.controller';

@Module({
   imports: [
      ChatModule,
      AuthModule,
      UserModule,
      ConfigModule.forRoot({
         isGlobal: true,
      }),
   ],
   controllers: [AppController],
})
export class AppModule {}
