import { Module } from '@nestjs/common';
import { ExtendedEthersService } from './extended-ethers.service';

@Module({
      providers: [ExtendedEthersService],
      exports: [ExtendedEthersService], // Export DatabaseService  
})
export class ExtendedEthersModule {}
