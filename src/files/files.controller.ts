import {
   Controller,
   Post,
   UploadedFiles,
   UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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
}
