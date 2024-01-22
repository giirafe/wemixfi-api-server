import { Module } from '@nestjs/common';
import { PoolV3Service } from './pool-v3.service';
import { ExtendedEthersModule } from 'src/extended-ethers/extended-ethers.module';
import { DatabaseModule } from 'src/database/database.module';
import { AccountModule } from 'src/account/account.module';


@Module({
  imports: [DatabaseModule, AccountModule, ExtendedEthersModule],
  providers: [PoolV3Service]
})
export class PoolV3Module {}
