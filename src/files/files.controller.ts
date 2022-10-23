import {
   Body,
   Controller,
   Get,
   Post,
   UploadedFiles,
   UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FetchImageDto } from './dto/fetch-image.dto';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
   constructor(private readonly filesService: FilesService) {}

   @Post('upload')
   @UseInterceptors(FilesInterceptor('files'))
   async upload(@UploadedFiles() files: Express.Multer.File[]) {
      const uploadedFile = await this.filesService.upload(files);

      return uploadedFile;
   }

   @Get('fetch-image')
   async fetchRemote(@Body() body: FetchImageDto) {
      const uploadedFile = await this.filesService.fetchImage(body.url);

      return uploadedFile;
   }
}
