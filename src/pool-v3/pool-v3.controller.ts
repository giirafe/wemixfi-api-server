import {
    Controller,
    Post,
    Body,
    Get,
    Query,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
import { PoolV3Service } from './pool-v3.service';
@Controller('pool-v3')
export class PoolV3Controller {
    constructor(private poolV3Service:PoolV3Service) {}

    @Post('easyMint')
    async easyMint(
      @Body('msgSender') msgSender: string,
      @Body('token0') token0: string,
      @Body('token1') token1: string,
      @Body('fee') fee: number, // 3000 => 0.3%
      @Body('tickLower') tickLower: number,
      @Body('tickUpper') tickUpper: number,
      @Body('amount0Desired') amount0Desired: number,
      @Body('amount1Desired') amount1Desired: number,
      @Body('amount0Min') amount0Min: number,
      @Body('amount1Min') amount1Min: number,
      @Body('deadline') deadline: number,
    ): Promise<any> {
      try {
        const result = await this.poolV3Service.easyMint(
          msgSender,
          token0,
          token1,
          fee,
          tickLower,
          tickUpper,
          amount0Desired,
          amount1Desired,
          amount0Min,
          amount1Min,
          deadline,
        );
        return result;
      } catch (error) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'There was a problem adding liquidity in Pool V3(Swap V3)',
            details: error.message,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
}
