import {
  Controller,
  Post,
  UploadedFile,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';
import { LocalFile } from '../common/decorators/file-upload.decorator';
import { imageFileFilter } from '../config/multer.config';
import { MulterFile } from '../types/multer.types';

@Controller('upload')
export class UploadController {
  constructor() {}

  @Post('product-image')
  @LocalFile('image', {
    fileFilter: imageFileFilter,
  })
  uploadProductImage(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    // Return the file path for storage in the product entity
    return {
      message: 'File uploaded successfully',
      fileName: file.filename,
      path: `/uploads/${file.filename}`,
    };
  }

  @Get('product-image/:filename')
  serveProductImage(@Param('filename') filename: string, @Res() res: Response) {
    return res.sendFile(join(process.cwd(), 'uploads', filename));
  }
}
