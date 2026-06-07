import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';
import { UsersModule } from './users-service/users.module';
import { OrdersModule } from './orders-service/orders.module';
import { AuthModule } from './auth-service/auth.module';
import { ProductsModule } from './products-service/products.module';
import { NotificationsModule } from './notifications-service/notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend'),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    OrdersModule,
    AuthModule,
    ProductsModule,
    NotificationsModule,
  ],
})
export class AppModule {}