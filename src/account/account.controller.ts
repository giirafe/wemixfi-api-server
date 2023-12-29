import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { Account, TransferTx } from '../database/database.model';
import { ethers } from 'ethers';

@Controller('account')
export class AccountController {
    // ORDER MATTERS ~ !
    constructor(private accountService: AccountService) {}

    @Post('register')
    setAccount(
        @Body('accountAddress') accountAddress : string,
        @Body('privateKey') privateKey : string
    ) : Promise<Account> {
        return this.accountService.setAccount(accountAddress, privateKey);
    }

    // Combined GET handler for returning specific Account or all Account
    @Get()
    async getAccounts(@Query('accountAddress') accountAddress?: string): Promise<Account | Account[]> {
        if (accountAddress) {
            return this.accountService.getAccount(accountAddress);
        } else {
            return this.accountService.getAccountAll();
        }
    }


    // Getting ETH balance of certain address account
    @Get('balance/:address')
    async addressBalance(@Param('address') address: string): Promise<number> {
      return await this.accountService.getBalance(address);
    }

    @Post('transferWemix')
    async transferWemix(
        @Body('senderAddress') senderAddress :string,
        @Body('receiverAddress') receiverAddress :string,
        @Body('amount') amount :number,
    ) : Promise<ethers.TransactionReceipt> {
        return await this.accountService.transferWemix(senderAddress,receiverAddress,amount);
    }

    @Get('txLogs')
    async getTxAll(): Promise<TransferTx[]> {
        return await this.accountService.getAllTransactionLogs();
    }
  
}
