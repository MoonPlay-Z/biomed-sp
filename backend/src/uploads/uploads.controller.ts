import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import sharp from 'sharp';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

// Configurar Cloudinary con las variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

@Controller('uploads')
export class UploadsController {
  @Post('parts')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
      limits: {
        fileSize: 12 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          return cb(
            new BadRequestException('Solo se permiten archivos de imagen'),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async uploadPartImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se ha proporcionado ningún archivo');
    }

    try {
      // 1. Optimizar la imagen con sharp en memoria
      const buffer = await sharp(file.buffer)
        .resize({
          width: 1200,
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toBuffer();

      // 2. Subir el buffer a Cloudinary usando un stream
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'jamechanic/parts',
            format: 'webp',
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('No result from Cloudinary'));
            resolve(result);
          },
        );

        streamifier.createReadStream(buffer).pipe(uploadStream);
      });

      // 3. Retornar la URL segura (HTTPS) provista por Cloudinary
      return {
        message: 'Imagen subida y optimizada correctamente',
        path: uploadResult.secure_url,
      };
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error al procesar y subir la imagen a la nube',
      );
    }
  }
}
