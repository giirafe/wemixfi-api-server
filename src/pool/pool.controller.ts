import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PoolService } from './pool.service';
@Controller('pool')
export class PoolController {
  constructor(private poolService: PoolService) {}

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
    @Body('deadline') deadline: number,
  ): Promise<bigint[]> {
    try {
      const result = await this.poolService.addLiquidity(
        msgSender,
        tokenA,
        tokenB,
        amountADesired,
        amountBDesired,
        amountAMin,
        amountBMin,
        to,
        deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem adding liquidity in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
    @Body('deadline') deadline: number,
  ): Promise<bigint[]> {
    try {
      const result = await this.poolService.addLiquidityWEMIX(
        msgSender,
        token,
        amountTokenDesired,
        amountWEMIXDesired,
        amountTokenMin,
        amountWEMIXMin,
        to,
        deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem adding liquidity WEMIX in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('removeLiquidity')
  async removeLiquidity(
    @Body('msgSender') msgSender: string,
    @Body('tokenA') tokenA: string,
    @Body('tokenB') tokenB: string,
    @Body('liquidity') liquidity: number,
    @Body('amountAMin') amountAMin: number,
    @Body('amountBMin') amountBMin: number,
    @Body('to') to: string,
    @Body('deadline') deadline: number,
  ): Promise<{ amountA: bigint; amountB: bigint }> {
    try {
      return await this.poolService.removeLiquidity(
        msgSender,
        tokenA,
        tokenB,
        liquidity,
        amountAMin,
        amountBMin,
        to,
        deadline,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem removing liquidity in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('removeLiquidityWEMIX')
  async removeLiquidityWEMIX(
    @Body('msgSender') msgSender: string,
    @Body('token') token: string,
    @Body('liquidity') liquidity: number,
    @Body('amountTokenMin') amountTokenMin: number,
    @Body('amountWEMIXMin') amountWEMIXMin: number,
    @Body('to') to: string,
    @Body('deadline') deadline: number,
  ): Promise<{ amountToken: bigint; amountWEMIX: bigint }> {
    try {
      return await this.poolService.removeLiquidityWEMIX(
        msgSender,
        token,
        liquidity,
        amountTokenMin,
        amountWEMIXMin,
        to,
        deadline,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem removing liquidity WEMIX in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
