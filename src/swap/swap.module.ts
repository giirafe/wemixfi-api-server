import { Module } from '@nestjs/common';
import { SwapController } from './swap.controller';
import { ExtendedEthersModule } from 'src/extended-ethers/extended-ethers.module';
import { DatabaseModule } from '../database/database.module';
import { AccountModule } from '../account/account.module';
import { SwapService } from './swap.service';

@Module({
  imports: [DatabaseModule, AccountModule, ExtendedEthersModule],
  controllers: [SwapController],
  providers: [SwapService],
})
export class SwapModule {}
