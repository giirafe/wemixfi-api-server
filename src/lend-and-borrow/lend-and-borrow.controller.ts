import { Controller, Post, Body, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { LendAndBorrowService, AssetType } from './lend-and-borrow.service';
import { ethers } from 'ethers';

@Controller('lend-and-borrow')
export class LendAndBorrowController {
    constructor(private lendAndBorrowService: LendAndBorrowService) {}

    @Get('snapshotWemix')
    async getAccountSnapshot(@Query('accountAddress') accountAddress: string): Promise<string[]> {
        try {
            return await this.lendAndBorrowService.getAccountSnapshot(accountAddress);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem getting the account snapshot',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('depositAsset')
    async depositAsset(
        @Body('senderAddress') senderAddress: string,
        @Body('amount') amount: number,
        @Body('assetType') assetType: AssetType
    ): Promise<ethers.TransactionReceipt> {
        try {
            return await this.lendAndBorrowService.depositAsset(senderAddress, amount, assetType);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'There was a problem with the deposit',
                details: error.message,
            }, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('borrowAsset')
    async borrowAsset(
        @Body('borrowerAddress') borrowerAddress: string,
        @Body('amount') amount: number,
        @Body('assetType') assetType: AssetType
    ): Promise<ethers.TransactionReceipt> {
        try {
            return await this.lendAndBorrowService.borrowAsset(borrowerAddress, amount, assetType);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'There was a problem with the borrowing',
                details: error.message,
            }, HttpStatus.BAD_REQUEST);
        }
    }
}
