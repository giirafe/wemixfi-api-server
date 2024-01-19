import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { TestRouteController } from './test-route.controller';
import { DatabaseModule } from '../database/database.module'; // Import DatabaseModule

@Module({
  imports: [
    HttpModule,
    DatabaseModule, // Import DatabaseModule to use DatabaseService
  ],
  controllers: [TestRouteController],
  exports: [],
})
export class TestRouteModule {}
