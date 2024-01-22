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

    // @Post('addLiquidity')
    // async addLiquidity(
    //   @Body('msgSender') msgSender: string,
    //   @Body('tokenA') tokenA: string,
    //   @Body('tokenB') tokenB: string,
    //   @Body('amountADesired') amountADesired: number,
    //   @Body('amountBDesired') amountBDesired: number,
    //   @Body('amountAMin') amountAMin: number,
    //   @Body('amountBMin') amountBMin: number,
    //   @Body('to') to: string,
    //   @Body('deadline') deadline: number,
    // ): Promise<bigint[]> {
    //   try {
    //     // const result = await this.poolV3Service.addLiquidity(
    //     //   msgSender,
    //     //   tokenA,
    //     //   tokenB,
    //     //   amountADesired,
    //     //   amountBDesired,
    //     //   amountAMin,
    //     //   amountBMin,
    //     //   to,
    //     //   deadline,
    //     // );
    //     // return result;
    //   } catch (error) {
    //     throw new HttpException(
    //       {
    //         status: HttpStatus.INTERNAL_SERVER_ERROR,
    //         error: 'There was a problem adding liquidity in Pool V3(Swap V3)',
    //         details: error.message,
    //       },
    //       HttpStatus.INTERNAL_SERVER_ERROR,
    //     );
    //   }
    // }
    
}
