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
        @Query('reserveIn') reserveIn : number,
        @Query('reserveOut') reserveOut : number,
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
        @Query('reserveIn') reserveIn : number,
        @Query('reserveOut') reserveOut : number,
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

    @Post('addLiquidityWEMIX')
    async addLiquidityWEMIX(
        @Body('msgSender') msgSender: string,
        @Body('token') token: string,
        @Body('amountTokenDesired') amountTokenDesired: number,
        @Body('amountWEMIXDesired') amountWEMIXDesired: number,
        @Body('amountTokenMin') amountTokenMin: number,
        @Body('amountWEMIXMin') amountWEMIXMin: number,
        @Body('to') to: string,
        @Body('deadline') deadline: number
    ): Promise<bigint []> {
        try {
            const result = await this.swapService.addLiquidityWEMIX(
                msgSender,
                token,
                amountTokenDesired,
                amountWEMIXDesired, 
                amountTokenMin,
                amountWEMIXMin,
                to,
                deadline
            );
            return result;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem adding liquidity WEMIX in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('addLiquidity')
    async addLiquidity(
        @Body('msgSender') msgSender: string,
        @Body('tokenA') tokenA: string,
        @Body('tokenB') tokenB: string,
        @Body('amountADesired') amountADesired: number,
        @Body('amountBDesired') amountBDesired: number,
        @Body('amountAMin') amountAMin: number,
        @Body('amountBMin') amountBMin: number,
        @Body('to') to: string,
        @Body('deadline') deadline: number
    ): Promise<bigint []> {
        try {
            const result = await this.swapService.addLiquidity(
                msgSender,
                tokenA,
                tokenB,
                amountADesired,
                amountBDesired,
                amountAMin,
                amountBMin,
                to,
                deadline
            );
            return result;
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem adding liquidity in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
