import { Controller, Post, Body, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SwapService } from './swap.service';

@Controller('swap')
export class SwapController {
    constructor(private swapService: SwapService) {}

    @Get('quote')
    async getQuote(
        @Query('amount') amount : number,
        @Query('reserveA') reserveA : number,
        @Query('reserveB') reserveB : number,
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

    @Post('swapExactTokensForTokens')
    async swapExactTokensForTokens(
        @Body('msgSender') msgSender: string,
        @Body('amountIn') amountIn: number,
        @Body('amountOutMin') amountOutMin: number,
        @Body('path') path: string[],
        @Body('to') to: string,
        @Body('deadline') deadline: number
    ): Promise<boolean> {
        try {
            return await this.swapService.swapExactTokensForTokens(msgSender, amountIn, amountOutMin, path, to, deadline);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem swapExactTokensForTokens in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('swapTokensForExactTokens')
    async swapTokensForExactTokens(
        @Body('msgSender') msgSender: string,
        @Body('amountOut') amountOut: number,
        @Body('amountInMax') amountInMax: number,
        @Body('path') path: string[],
        @Body('to') to: string,
        @Body('deadline') deadline: number
    ): Promise<boolean> {
        try {
            return await this.swapService.swapTokensForExactTokens(msgSender, amountOut, amountInMax, path, to, deadline);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem swapTokensForExactTokens in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('swapExactWEMIXForTokens')
    async swapExactWEMIXForTokens(
        @Body('msgSender') msgSender: string,
        @Body('amountIn') amountIn: number,
        @Body('amountOutMin') amountOutMin: number,
        @Body('path') path: string[],
        @Body('to') to: string,
        @Body('deadline') deadline: number
    ): Promise<boolean> {
        try {
            return await this.swapService.swapExactWEMIXForTokens(msgSender, amountIn, amountOutMin, path, to, deadline);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem swapExactWEMIXForTokens in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('swapTokensForExactWEMIX')
    async swapTokensForExactWEMIX(
        @Body('msgSender') msgSender: string,
        @Body('amountOut') amountOut: number,
        @Body('amountInMax') amountInMax: number,
        @Body('path') path: string[],
        @Body('to') to: string,
        @Body('deadline') deadline: number
    ): Promise<boolean> {
        try {
            return await this.swapService.swapTokensForExactWEMIX(msgSender, amountOut, amountInMax, path, to, deadline);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem swapTokensForExactWEMIX in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('swapExactTokensForWEMIX')
    async swapExactTokensForWEMIX(
        @Body('msgSender') msgSender: string,
        @Body('amountIn') amountIn: number,
        @Body('amountOutMin') amountOutMin: number,
        @Body('path') path: string[],
        @Body('to') to: string,
        @Body('deadline') deadline: number
    ): Promise<boolean> {
        try {
            return await this.swapService.swapExactTokensForWEMIX(
                msgSender, 
                amountIn, 
                amountOutMin, 
                path, 
                to, 
                deadline);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem swapExactTokensForWEMIX in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post('swapWEMIXForExactTokens')
    async swapWEMIXForExactTokens(
        @Body('msgSender') msgSender: string,
        @Body('amountOut') amountOut: number,
        @Body('amountInMax') amountInMax: number,
        @Body('path') path: string[],
        @Body('to') to: string,
        @Body('deadline') deadline: number
    ): Promise<boolean> {
        try {
            return await this.swapService.swapWEMIXForExactTokens(
                msgSender, 
                amountOut, 
                amountInMax, 
                path, 
                to, 
                deadline);
        } catch (error) {
            throw new HttpException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                error: 'There was a problem swap WEMIX For EXACT Tokens in Swap V2',
                details: error.message,
            }, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
