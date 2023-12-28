import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { TestRouteController } from './test-route.controller';
import { TestRouteService } from './test-route.service';
import { AccountSchema, TransferTxSchema } from './test-route.schema';
import { HttpModule } from '@nestjs/axios'; // for internal Http Calls

@Module({
  imports:[
    MongooseModule.forFeature([
      {name:'Account',schema:AccountSchema},
      {name:'TransferTx',schema:TransferTxSchema},
    ]),
    HttpModule,
  ],
  controllers: [TestRouteController],
  providers: [TestRouteService]
})
export class TestRouteModule {}
