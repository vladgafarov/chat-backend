import {
   Body,
   Controller,
   Get,
   HttpCode,
   Post,
   Request,
   Res,
   UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from 'src/auth/auth.service';
import { LoginDto } from 'src/auth/dto/login.dto';
import { SignUpDto } from 'src/auth/dto/signup.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
   constructor(private readonly authService: AuthService) {}

   @Post('signup')
   signup(@Body() dto: SignUpDto) {
      return this.authService.signup(dto);
   }

   @Post('login')
   @HttpCode(200)
   async login(
      @Body() dto: LoginDto,
      @Res({ passthrough: true }) res: Response,
   ) {
      const data = await this.authService.login(dto);

      res.cookie('access_token', data.access_token, {
         httpOnly: true,
      });
      res.cookie('refresh_token', data.refresh_token, {
         httpOnly: true,
      });

      return data;
   }
   
   @Post('logout')
   @HttpCode(200)
   async logout(@Res({ passthrough: true }) res: Response) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
   }

   @UseGuards(JwtAuthGuard)
   @Get('profile')
   getProfile(@Request() req) {
      return req.user;
   }
}
