import { Module } from '@nestjs/common';
import { PoolV3Service } from './pool-v3.service';

@Module({
  providers: [PoolV3Service]
})
export class PoolV3Module {}
