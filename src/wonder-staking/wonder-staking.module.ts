import { Module } from '@nestjs/common';
import { WonderStakingService } from './wonder-staking.service';
import { WonderStakingController } from './wonder-staking.controller';
import { AccountModule } from 'src/account/account.module';
import { DatabaseModule } from 'src/database/database.module';
import { ExtendedEthersModule } from 'src/extended-ethers/extended-ethers.module';

@Module({
  imports: [DatabaseModule, AccountModule, ExtendedEthersModule],
  controllers: [WonderStakingController],
  providers: [WonderStakingService],
})
export class WonderStakingModule {}
