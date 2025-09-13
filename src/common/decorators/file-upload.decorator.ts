import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { multerConfig } from '../../config/multer.config';

export function LocalFile(
  fieldName: string,
  options: Partial<MulterOptions> = {},
) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, { ...multerConfig, ...options }),
    ),
  );
}

export function LocalFiles(
  fieldName: string,
  maxCount: number,
  options: Partial<MulterOptions> = {},
) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldName, maxCount, { ...multerConfig, ...options }),
    ),
  );
}
