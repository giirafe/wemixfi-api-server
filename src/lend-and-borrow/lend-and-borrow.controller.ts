import { Controller, Post, Body, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { LendAndBorrowService } from './lend-and-borrow.service';
import { ethers } from 'ethers';

@Controller('lend-and-borrow')
export class LendAndBorrowController {
    constructor(private lendAndBorrowService: LendAndBorrowService) {}

    @Get('snapshotWemix')
    async getAccountSnapshot(
        @Query('accountAddress') accountAddress: string
    ): Promise<string[]> {
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

    @Get('liquidationInfo')
    async getLiquidationInfo(
        @Query('accountAddress') accountAddress: string
    ) : Promise<string> {
        try {
            return await this.lendAndBorrowService.getLiquidationInfo(accountAddress);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem getting the liquidation info',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('depositAsset')
    async depositAsset(
        @Body('senderAddress') senderAddress: string,
        @Body('amount') amount: number,
        @Body('assetAddress') assetAddress: string
    ): Promise<ethers.TransactionReceipt> {
        try {
            return await this.lendAndBorrowService.depositAsset(senderAddress, amount, assetAddress);
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
        @Body('assetAddress') assetAddress: string
    ): Promise<ethers.TransactionReceipt> {
        try {
            return await this.lendAndBorrowService.borrowAsset(borrowerAddress, amount, assetAddress);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'There was a problem with the Borrowing',
                details: error.message,
            }, HttpStatus.BAD_REQUEST);
        }
    }

    @Post('liquidateAsset')
    async liquidateAsset(
        @Body('liquidatorAddress') liquidatorAddress: string,
        @Body('borrowerAddress') borrowerAddress: string,
        @Body('repayAmount') repayAmount: number,
        @Body('liquidateAssetAddress') liquidateAssetAddress: string,
        @Body('collateralAddress') collateralAddress: string,
    ): Promise<ethers.TransactionReceipt> {
        try {
            return await this.lendAndBorrowService.liquidateAsset(liquidatorAddress,borrowerAddress, repayAmount, liquidateAssetAddress, collateralAddress);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.BAD_REQUEST,
                error: 'There was a problem with the Liquidating',
                details: error.message,
            }, HttpStatus.BAD_REQUEST);
        }
    }
}
