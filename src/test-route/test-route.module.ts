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
    // 아래와 같이 Configuration을 진행할 수도 있음
    // HttpModule.register({
    //   timeout: 5000,
    //   maxRedirects: 5,
    // })
  ],
  controllers: [TestRouteController],
  providers: [TestRouteService]
})
export class TestRouteModule {}
