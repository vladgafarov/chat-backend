import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, genSalt, hash } from 'bcrypt';
import { UserPayload } from 'src/common/types/UserPayload';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { INVALID_CRIDENTIALS } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
   constructor(
      private readonly jwtService: JwtService,
      private readonly config: ConfigService,
      private readonly userService: UserService,
      private readonly prismaService: PrismaService,
   ) {}

   async signup(dto: SignUpDto) {
      const passwordHash = await this.hashString(dto.password);

      await this.userService.createOne({ ...dto, password: passwordHash });

      return 'good';
   }

   async login(dto: LoginDto) {
      const user = await this.validateUser(dto);
      const payload: UserPayload = { id: user.id };

      return {
         access_token: this.jwtService.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
         }),
         refresh_token: this.jwtService.sign(payload, {
            secret: this.config.get('JWT_SECRET'),
            expiresIn: '60d',
         }),
      };
   }

   async validateUser(dto: LoginDto) {
      const user = await this.prismaService.user.findUnique({
         where: { email: dto.email },
      });

      if (!user) {
         throw new BadRequestException(INVALID_CRIDENTIALS);
      }

      const isPasswordValid = await compare(dto.password, user.password);

      if (!isPasswordValid) {
         throw new BadRequestException(INVALID_CRIDENTIALS);
      }

      return user;
   }

   async hashString(data: string) {
      const salt = await genSalt(12);
      const hashedString = await hash(data, salt);

      return hashedString;
   }
}
