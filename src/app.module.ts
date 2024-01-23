import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose'; // Not using MongooseModule anymore
import { SequelizeModule } from '@nestjs/sequelize';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TestRouteModule } from './test-route/test-route.module';
import { DatabaseModule } from './database/database.module';
import { LendAndBorrowModule } from './lend-and-borrow/lend-and-borrow.module';
import { AccountModule } from './account/account.module';
import { SwapModule } from './swap/swap.module';
import { PoolModule } from './pool/pool.module';
import { SwapV3Module } from './swap-v3/swap-v3.module';
import { PoolV3Module } from './pool-v3/pool-v3.module';
import { ExtendedEthersModule } from './extended-ethers/extended-ethers.module';

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
    DatabaseModule,
    AccountModule,
    LendAndBorrowModule,
    PoolModule,
    SwapModule,
    SwapV3Module,
    PoolV3Module,
    ExtendedEthersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
