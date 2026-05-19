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
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

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

    const uploadDir = path.join(process.cwd(), 'uploads', 'parts');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${uuidv4()}.webp`;
    const filepath = path.join(uploadDir, filename);

    try {
      await sharp(file.buffer)
        .resize({
          width: 1200,
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(filepath);

      return {
        message: 'Imagen subida y optimizada correctamente',
        path: `/uploads/parts/${filename}`,
      };
    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      throw new InternalServerErrorException(
        'Ocurrió un error al procesar y guardar la imagen',
      );
    }
  }
}
