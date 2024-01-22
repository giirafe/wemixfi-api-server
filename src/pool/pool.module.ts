import { Module } from '@nestjs/common';
import { PoolController } from './pool.controller';
import { PoolService } from './pool.service';
import { DatabaseModule } from '../database/database.module';
import { AccountModule } from '../account/account.module';
import { ExtendedEthersModule } from 'src/extended-ethers/extended-ethers.module';

@Module({
  imports: [DatabaseModule, AccountModule,ExtendedEthersModule],
  controllers: [PoolController],
  providers: [PoolService],
})
export class PoolModule {}
