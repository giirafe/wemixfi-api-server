import { Module } from '@nestjs/common';
import { SwapController } from './swap.controller';
import { DatabaseModule } from '../database/database.module';
import { AccountModule } from '../account/account.module';
import { SwapService } from './swap.service';

@Module({
  imports:[
    DatabaseModule, AccountModule,
  ],
  controllers: [SwapController],
  providers: [SwapService]
})
export class SwapModule {}
