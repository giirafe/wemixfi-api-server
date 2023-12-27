import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestRouteModule } from './test-route/test-route.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/WemixFi_API_DB'), // mongodb' name was set to 'WemixFi_API_DB'
    TestRouteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
