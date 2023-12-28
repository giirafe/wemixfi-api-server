import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose'; // Not using MongooseModule anymore
import { SequelizeModule } from '@nestjs/sequelize';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestRouteModule } from './test-route/test-route.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'localDB',
      autoLoadModels: true,
      synchronize: true,
    }),
    TestRouteModule,
    DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
