import { Controller, Post, Body, Get, Param, Res, Query } from '@nestjs/common';
// import { testRouteService } from './test-route.service';
import { DatabaseService } from '../database/database.service';
import { ethers } from 'ethers';

@Controller('test-route')
export class TestRouteController {
  // ORDER MATTERS ~ !
  constructor(private databaseService: DatabaseService) {}

  // @Post('register')
  // setAccount(
  //     @Body('accountAddress') accountAddress : string,
  //     @Body('privateKey') privateKey : string
  // ) : Promise<Account> {
  //     return this.databaseService.setAccount(accountAddress, privateKey);
  // }

  // @Get('account')
  // getAccount(@Query('accountAddress') accountAddress : string) : Promise<Account> {
  //     return this.databaseService.getAccount(accountAddress);
  // }

  // @Get('account')
  // getAccountAll() : Promise<Account[]> {
  //     return this.databaseService.getAccountAll();
  // }

  // // Getting ETH balance of certain address account
  // @Get('balance/:address')
  // async addressBalance(@Param('address') address: string): Promise<number> {
  //   return await this.databaseService.getBalance(address);
  // }

  // @Post('transferWemix')
  // async transferWemix(
  //     @Body('senderAddress') senderAddress :string,
  //     @Body('receiverAddress') receiverAddress :string,
  //     @Body('amount') amount :number,
  // ) : Promise<ethers.TransactionReceipt> {
  //     return await this.databaseService.transferWemix(senderAddress,receiverAddress,amount);
  // }

  // @Get('txLogs')
  // async getTxAll(): Promise<TransferTx[]> {
  //     return await this.databaseService.getAllTransactionLogs();
  // }
}
