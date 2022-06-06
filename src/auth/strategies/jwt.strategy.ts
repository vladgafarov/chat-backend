import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserPayload } from 'src/common/types/UserPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(private readonly config: ConfigService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: config.get('JWT_SECRET'),
      });
   }

   async validate(payload: UserPayload) {
      return { id: payload.id };
   }
}
