import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PoolService } from './pool.service';
import {
  AddLiquidityDto,
  AddLiquidityWEMIXDto,
  RemoveLiquidityDto,
  RemoveLiquidityWEMIXDto,
} from 'src/dto/pool-dto';

@Controller('pool')
export class PoolController {
  constructor(private poolService: PoolService) {}

  @Post('addLiquidity')
  async addLiquidity(@Body() dto: AddLiquidityDto): Promise<bigint[]> {
    try {
      const result = await this.poolService.addLiquidity(
        dto.msgSender,
        dto.tokenA,
        dto.tokenB,
        dto.amountADesired,
        dto.amountBDesired,
        dto.amountAMin,
        dto.amountBMin,
        dto.to,
        dto.deadline,
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
    @Body() dto: AddLiquidityWEMIXDto,
  ): Promise<bigint[]> {
    try {
      const result = await this.poolService.addLiquidityWEMIX(
        dto.msgSender,
        dto.token,
        dto.amountTokenDesired,
        dto.amountWEMIXDesired,
        dto.amountTokenMin,
        dto.amountWEMIXMin,
        dto.to,
        dto.deadline,
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
    @Body() dto: RemoveLiquidityDto,
  ): Promise<{ amountA: bigint; amountB: bigint }> {
    try {
      return await this.poolService.removeLiquidity(
        dto.msgSender,
        dto.tokenA,
        dto.tokenB,
        dto.liquidity,
        dto.amountAMin,
        dto.amountBMin,
        dto.to,
        dto.deadline,
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
    @Body() dto: RemoveLiquidityWEMIXDto,
  ): Promise<{ amountA: bigint; amountB: bigint }> {
    try {
      return await this.poolService.removeLiquidityWEMIX(
        dto.msgSender,
        dto.token,
        dto.liquidity,
        dto.amountTokenMin,
        dto.amountWEMIXMin,
        dto.to,
        dto.deadline,
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
