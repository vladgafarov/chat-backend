import {
   Body,
   Controller,
   Get,
   HttpCode,
   Post,
   Request,
   UseGuards,
} from '@nestjs/common';
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
   login(@Body() dto: LoginDto) {
      return this.authService.login(dto);
   }

   @UseGuards(JwtAuthGuard)
   @Get('profile')
   getProfile(@Request() req) {
      return req.user;
   }
}
