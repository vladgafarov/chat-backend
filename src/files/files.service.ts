import { Injectable } from '@nestjs/common';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import fetch from 'node-fetch';
import * as sharp from 'sharp';
import { AvatarThumbnail } from 'src/user/dto/avatar-thumbnail';
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
               url: `http://localhost:3000/static/${
                  subfolderName ? subfolderName + '/' : ''
               }${fileName}`,
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

   async cropImage(
      image: Buffer,
      { width, height, x, y }: AvatarThumbnail,
   ): Promise<Buffer> {
      const result = await sharp(image)
         .extract({ width, height, left: x, top: y })
         .webp()
         .toBuffer();

      return result;
   }

   async resizeImage(
      image: Buffer,
      width: number,
      height: number,
   ): Promise<Buffer> {
      const result = await sharp(image).resize(width, height).webp().toBuffer();

      return result;
   }

   async fetchImage(url: string): Promise<Buffer> {
      const res = await fetch(url);
      const buffer = await res.body.pipe(sharp()).webp().toBuffer();

      return buffer;
   }
}
