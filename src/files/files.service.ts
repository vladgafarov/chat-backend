import { Injectable } from '@nestjs/common';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import * as sharp from 'sharp';
import { FileElementResponse } from './dto/file-element.response';

@Injectable()
export class FilesService {
   async upload(
      files: Express.Multer.File[],
      subfolderName?: string,
   ): Promise<FileElementResponse[]> {
      const uploadFolder = `${path}/uploads/${
         subfolderName ? subfolderName : ''
      }`;

      await ensureDir(uploadFolder);

      const res = files.map(async (file) => {
         if (file.mimetype.includes('image')) {
            const fileName = `${Date.now()}-${
               file.originalname.split('.')[0]
            }.webp`;
            const webp = await this.convertImageToWebp(file.buffer);

            await writeFile(`${uploadFolder}/${fileName}`, webp);

            return {
               name: fileName,
               size: webp.byteLength,
               mimetype: 'image/webp',
               url: fileName,
            };
         }

         const fileName = `${Date.now()}-${file.originalname}`;

         await writeFile(`${uploadFolder}/${fileName}`, file.buffer);

         return {
            name: fileName,
            size: file.size,
            mimetype: file.mimetype,
            url: `http://localhost:3000/static/${
               subfolderName ? subfolderName + '/' : ''
            }${fileName}`,
         };
      });

      return Promise.all(res);
   }

   async convertImageToWebp(buffer: Buffer): Promise<Buffer> {
      const webp = await sharp(buffer).webp().toBuffer();

      return webp;
   }
}
