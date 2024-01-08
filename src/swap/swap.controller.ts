import { Controller, Post, Body, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SwapService } from './swap.service';
import { ethers } from 'ethers';
@Controller('swap')
export class SwapController {
    constructor(private swapService: SwapService) {}

    @Get('quote')
    async getQuote(
        @Query('amount') amount : number,
        @Query('reserveA') reserveA : string,
        @Query('reserveB') reserveB : string,
    ): Promise<bigint> {
        try {
            return await this.swapService.getQuote(amount,reserveA,reserveB);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem getting Quote in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('amountOut')
    async getAmountOut(
        @Query('amountIn') amountIn : number,
        @Query('reserveIn') reserveIn : string,
        @Query('reserveOut') reserveOut : string,
    ): Promise<bigint> {
        try {
            return await this.swapService.getAmountOut(amountIn,reserveIn,reserveOut);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem getting AmountOut in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('amountIn')
    async getAmountIn(
        @Query('amountOut') amountOut : number,
        @Query('reserveIn') reserveIn : string,
        @Query('reserveOut') reserveOut : string,
    ): Promise<bigint> {
        try {
            return await this.swapService.getAmountIn(amountOut,reserveIn,reserveOut);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem getting AmountIn in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('amountsOut')
    async getAmountsOut(
        @Query('amountIn') amountIn : number,
        @Query('path') path : string[],
    ): Promise<bigint[]> {
        try {
            return await this.swapService.getAmountsOut(amountIn, path);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem getting AmountS Out in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('amountsIn')
    async getAmountsIn(
        @Query('amountOut') amountOut : number,
        @Query('path') path : string[],
    ): Promise<bigint[]> {
        try {
            return await this.swapService.getAmountsIn(amountOut, path);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem getting AmountS In in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
