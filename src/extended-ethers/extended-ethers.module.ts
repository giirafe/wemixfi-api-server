import { Module } from '@nestjs/common';
import { ExtendedEthersService } from './extended-ethers.service';
import { DatabaseModule } from 'src/database/database.module';
import { AccountModule } from 'src/account/account.module';

@Module({
  imports: [DatabaseModule, AccountModule],
  providers: [ExtendedEthersService],
  exports: [ExtendedEthersService], // Export DatabaseService
})
export class ExtendedEthersModule {}
