import { Module } from '@nestjs/common';
import { LiquidStakingController } from './liquid-staking.controller';
import { LiquidStakingService } from './liquid-staking.service';

@Module({
  controllers: [LiquidStakingController],
  providers: [LiquidStakingService],
})
export class LiquidStakingModule {}
