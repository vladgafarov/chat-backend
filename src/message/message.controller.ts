import {
   Body,
   Controller,
   Post,
   Request,
   UploadedFiles,
   UseGuards,
   UseInterceptors,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserPayload } from 'src/common/types/UserPayload';
import { FilesService } from 'src/files/files.service';
import { AddMessageDto } from './dto/add-message.dto';
import { MessageService } from './message.service';

@UseGuards(JwtAuthGuard)
@Controller('message')
export class MessageController {
   constructor(
      private readonly eventEmitter: EventEmitter2,
      private readonly messageService: MessageService,
      private readonly filesService: FilesService,
   ) {}

   @Post()
   @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 3 }]))
   async addMessage(
      @UploadedFiles() uploadedFiles: { files?: Express.Multer.File[] },
      @Body() dto: AddMessageDto,
      @Request() req,
   ) {
      console.log(dto);

      const user = req.user as UserPayload;

      let filesIds: { id: string }[] = undefined;
      if (uploadedFiles.files?.length > 0) {
         filesIds = (await this.filesService.upload(uploadedFiles.files)).map(
            (i) => ({
               id: i.id,
            }),
         );
      }

      const message = await this.messageService.addMessage(
         user.id,
         dto,
         filesIds,
      );

      this.eventEmitter.emit('message.add', message);

      return message;
   }
}
