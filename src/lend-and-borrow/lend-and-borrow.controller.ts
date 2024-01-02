import { Controller, Post, Body, Get, Param, Res, Query } from '@nestjs/common';
// import { testRouteService } from './test-route.service';
import { DatabaseService } from '../database/database.service';
import { LendAndBorrowService } from './lend-and-borrow.service';
import { Account, TransferTx } from '../database/database.model';
import { ethers } from 'ethers';


@Controller('lend-and-borrow')
export class LendAndBorrowController {
    constructor(
        private databaseService: DatabaseService,
        private lendAndBorrowService : LendAndBorrowService) {}

    @Get('snapshotWemix')
    async getAccountSnapshot(@Query('accountAddress') accountAddress : string) : Promise<string []> {
        return this.lendAndBorrowService.getAccountSnapshot(accountAddress);
    }

    @Post('depositWemix')
    async depositWemix(
        @Body('senderAddress') senderAddress : string,
        @Body('amount') amount : number,
    ) : Promise<ethers.TransactionReceipt> {
        return this.lendAndBorrowService.depositWemix(senderAddress,amount);
    }

    @Post('borrowWemixDollar')
    async borrowWemixDollar(
        @Body('borrowerAddress') borrowerAddress : string,
        @Body('amount') amount : number,
    ) : Promise<ethers.TransactionReceipt> {
        return this.lendAndBorrowService.borrowWemixDollar(borrowerAddress,amount);
    }
    
}
