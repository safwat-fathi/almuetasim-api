/* eslint-disable sonarjs/content-length */

import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { randomBytes } from 'crypto';
import CONSTANTS from 'src/common/constants';

// File filter for image files
export const imageFileFilter = (
  _req: Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
) => {
  const imageRegex = /\/(jpg|jpeg|png|gif)$/i;
  if (!imageRegex.test(file.mimetype)) {
    return callback(
      new BadRequestException('Only image files are allowed!'),
      false,
    );
  }
  callback(null, true);
};

// Multer configuration for local storage
export const multerConfig: MulterOptions = {
  storage: diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
      // Generate unique filename using crypto for security
      const uniqueSuffix = Date.now() + '-' + randomBytes(4).readUInt32BE(0);
      const ext = extname(file.originalname);
      const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
      cb(null, filename);
    },
  }),
  limits: { fileSize: CONSTANTS.FILE.MAX_FILE_SIZE }, // 5MB limit
};
