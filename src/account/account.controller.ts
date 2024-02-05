import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { Account, TransferTx } from '../database/database.model';
import { ethers } from 'ethers';

@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('register')
  async setAccount(
    @Body('privateKey') privateKey: string,
  ): Promise<Account> {
    try {
      return await this.accountService.setAccount(privateKey);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'There was a problem registering the account',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get()
  async getAccounts(
    @Query('accountAddress') accountAddress?: string,
  ): Promise<Account | Account[]> {
    try {
      if (accountAddress) {
        return await this.accountService.getAccount(accountAddress);
      } else {
        return await this.accountService.getAccountAll();
      }
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem fetching accounts',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('balance/:address')
  async addressBalance(@Param('address') address: string): Promise<number> {
    try {
      return await this.accountService.getBalance(address);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem fetching the balance',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('transferWemix')
  async transferWemix(
    @Body('senderAddress') senderAddress: string,
    @Body('receiverAddress') receiverAddress: string,
    @Body('amount') amount: number,
  ): Promise<ethers.TransactionReceipt> {
    try {
      return await this.accountService.transferWemix(
        senderAddress,
        receiverAddress,
        amount,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem executing the transfer',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('txLogs')
  async getTxAll(): Promise<TransferTx[]> {
    try {
      return await this.accountService.getAllTransactionLogs();
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem fetching transaction logs',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
