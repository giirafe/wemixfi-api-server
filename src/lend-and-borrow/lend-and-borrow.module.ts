import { Module } from '@nestjs/common';
import { LendAndBorrowController } from './lend-and-borrow.controller';
import { ExtendedEthersModule } from 'src/extended-ethers/extended-ethers.module';
import { DatabaseModule } from '../database/database.module';
import { AccountModule } from '../account/account.module';
import { LendAndBorrowService } from './lend-and-borrow.service';

@Module({
  imports: [DatabaseModule, AccountModule, ExtendedEthersModule],
  controllers: [LendAndBorrowController],
  providers: [LendAndBorrowService],
})
export class LendAndBorrowModule {}
