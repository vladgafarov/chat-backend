import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from 'src/prisma.service';
import { UserModule } from 'src/user/user.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
   imports: [
      UserModule,
      PassportModule,
      JwtModule.registerAsync({
         inject: [ConfigService],
         useFactory: (config: ConfigService) => ({
            secret: config.get('JWT_SECRET'),
            signOptions: {
               //TODO 60s
               expiresIn: '60d',
            },
         }),
      }),
   ],
   providers: [AuthService, JwtStrategy, PrismaService],
   exports: [AuthService],
})
export class AuthModule {}
