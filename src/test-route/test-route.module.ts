import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TestRouteController } from './test-route.controller';
import { TestRouteService } from './test-route.service';
import { AccountSchema } from './test-route.schema';

@Module({
  imports:[
    MongooseModule.forFeature([{name:'TestRouteSchema',schema:AccountSchema}]),
  ],
  controllers: [TestRouteController],
  providers: [TestRouteService]
})
export class TestRouteModule {}
