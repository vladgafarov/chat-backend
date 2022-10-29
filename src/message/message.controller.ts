import {
   Controller,
   Post,
   UploadedFiles,
   UseGuards,
   UseInterceptors,
   Body,
   Request,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserPayload } from 'src/common/types/UserPayload';
import { AddMessageDto } from './dto/add-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { MessageService } from './message.service';

@UseGuards(JwtAuthGuard)
@Controller('message')
export class MessageController {
   constructor(
      private readonly eventEmitter: EventEmitter2,
      private readonly messageService: MessageService,
   ) {}

   @Post()
   @UseInterceptors(FileFieldsInterceptor([{ name: 'file', maxCount: 3 }]))
   async addMessage(
      @UploadedFiles() files: { file?: Express.Multer.File[] },
      @Body() dto: AddMessageDto & ReplyMessageDto,
      @Request() req,
   ) {
      const user = req.user as UserPayload;

      const message = await this.messageService.addMessage(user.id, dto);

      this.eventEmitter.emit('message.add', message);

      return message;
   }
}
