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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
