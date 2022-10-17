import { Injectable } from '@nestjs/common';
import { FileElementResponse } from './dto/file-element.response';

@Injectable()
export class FilesService {
   upload(files: Express.Multer.File[]): Promise<FileElementResponse[]> {
      return Promise.resolve([]);
   }
}
