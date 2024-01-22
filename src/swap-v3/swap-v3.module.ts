import { Module } from '@nestjs/common';
import { SwapV3Controller } from './swap-v3.controller';
import { SwapV3Service } from './swap-v3.service';

@Module({
  controllers: [SwapV3Controller],
  providers: [SwapV3Service]
})
export class SwapV3Module {}
