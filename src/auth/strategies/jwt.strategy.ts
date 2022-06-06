import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserPayload } from 'src/common/types/UserPayload';
import { cookieExtractor } from '../cookieExtractor';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(private readonly config: ConfigService) {
      super({
         jwtFromRequest: cookieExtractor,
         ignoreExpiration: false,
         secretOrKey: config.get('JWT_SECRET'),
      });
   }

   async validate(payload: UserPayload) {
      return { id: payload.id };
   }
}
