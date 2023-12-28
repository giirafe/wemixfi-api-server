import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { HttpModule } from '@nestjs/axios';

import { TestRouteController } from './test-route.controller';
import { TestRouteService } from './test-route.service';
import { DatabaseModule } from '../database/database.module'; // Import DatabaseModule

@Module({
  imports: [
    SequelizeModule.forFeature([/* ... other models if needed */]),
    HttpModule,
    DatabaseModule, // Import DatabaseModule to use DatabaseService
  ],
  controllers: [TestRouteController],
})
export class TestRouteModule {}
