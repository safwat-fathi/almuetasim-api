import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { UploadController } from './upload.controller';
import validateContentLength from './middlewares/content-length.middleware';

@Module({
  controllers: [UploadController],
})
export class UploadModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(validateContentLength).forRoutes('upload'); // replace with your route
  }
}
