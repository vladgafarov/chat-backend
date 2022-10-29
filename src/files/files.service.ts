import { Injectable } from '@nestjs/common';
import { File } from '@prisma/client';
import { path } from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import fetch from 'node-fetch';
import * as sharp from 'sharp';
import { PrismaService } from 'src/prisma.service';
import { AvatarThumbnail } from 'src/user/dto/avatar-thumbnail';

@Injectable()
export class FilesService {
   constructor(private readonly prismaService: PrismaService) {}

   async upload(
      files: Express.Multer.File[],
      subfolderName?: string,
   ): Promise<File[]> {
      const uploadFolder = `${path}/uploads/${
         subfolderName ? subfolderName : ''
      }`;

      await ensureDir(uploadFolder);

      const filesCreationPromise = files.map(async (file) => {
         let fileName: string = Date.now() + '-' + file.originalname;
         let fileUrl = `http://localhost:3000/static/${
            subfolderName ? subfolderName + '/' : ''
         }${fileName}`;
         let fileBuffer: Buffer = file.buffer;

         if (file.mimetype.includes('image')) {
            fileName += '.webp';
            fileUrl += '.webp';
            fileBuffer = await this.convertImageToWebp(fileBuffer);
         }

         await writeFile(`${uploadFolder}/${fileName}`, fileBuffer);

         console.log({
            name: fileName,
            size: file.size,
            mimetype: file.mimetype,
            url: fileUrl,
         });

         const fileDb = await this.prismaService.file.create({
            data: {
               name: fileName,
               size: file.size,
               mimetype: file.mimetype,
               url: fileUrl,
            },
         });

         return fileDb;
      });

      return Promise.all(filesCreationPromise);
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
