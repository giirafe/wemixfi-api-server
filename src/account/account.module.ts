import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

import { AccountController } from './account.controller';
import { AccountService } from './account.service';
import { DatabaseModule } from '../database/database.module'; // Import DatabaseModule

@Module({
  imports: [
    HttpModule,
    DatabaseModule, // Import DatabaseModule to use DatabaseService
  ],
  controllers: [AccountController],
  providers : [AccountService],
  exports: [
    AccountService
  ]
})
export class AccountModule {}
