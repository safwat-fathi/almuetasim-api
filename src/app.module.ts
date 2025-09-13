import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './products/products.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { UploadModule } from './upload/upload.module';
import { SessionsModule } from './sessions/sessions.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import dataSource from './config/orm.config';
import { ThrottlerModule } from '@nestjs/throttler';
import CONSTANTS from './common/constants';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({ ...dataSource.options, autoLoadEntities: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: CONSTANTS.RATE_LIMIT.WINDOW_MS,
          limit: CONSTANTS.RATE_LIMIT.MAX,
        },
      ],
    }),
    ProductsModule,
    CategoriesModule,
    // OrdersModule,
    AnalyticsModule,
    AuthModule,
    UploadModule,
    SessionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
