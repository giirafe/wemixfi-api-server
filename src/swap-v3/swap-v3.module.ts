import { Module } from '@nestjs/common';
import { SwapV3Controller } from './swap-v3.controller';
import { SwapV3Service } from './swap-v3.service';
import { DatabaseModule } from 'src/database/database.module';
import { AccountModule } from 'src/account/account.module';
import { ExtendedEthersModule } from 'src/extended-ethers/extended-ethers.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [DatabaseModule, AccountModule, ExtendedEthersModule, HttpModule],
  controllers: [SwapV3Controller],
  providers: [SwapV3Service],
})
export class SwapV3Module {}
