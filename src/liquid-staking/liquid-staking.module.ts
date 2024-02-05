import { Module } from '@nestjs/common';
import { LiquidStakingController } from './liquid-staking.controller';
import { LiquidStakingService } from './liquid-staking.service';
import { AccountModule } from 'src/account/account.module';
import { DatabaseModule } from 'src/database/database.module';
import { ExtendedEthersModule } from 'src/extended-ethers/extended-ethers.module';

@Module({
  imports: [DatabaseModule, AccountModule, ExtendedEthersModule],
  controllers: [LiquidStakingController],
  providers: [LiquidStakingService],
})
export class LiquidStakingModule {}
