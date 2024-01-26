import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { PoolV3Service } from './pool-v3.service';
import { BigNumberish } from 'ethers';
@Controller('pool-v3')
export class PoolV3Controller {
  constructor(private poolV3Service: PoolV3Service) {}

  @Get('positionInfo')
  async getPositionInfo(
    @Query('tokenId') tokenId: number
  ) {
    try {
      const result = await this.poolV3Service.getPositionInfo(tokenId);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getting position info in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

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
          error: 'There was a problem easyMint in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('increaseLiquidity')
  async increaseLiquidity(
    @Body('msgSender') msgSender: string,
    @Body('tokenId') tokenId: number,
    @Body('amount0Desired') amount0Desired: number,
    @Body('amount1Desired') amount1Desired: number,
    @Body('amount0Min') amount0Min: number,
    @Body('amount1Min') amount1Min: number,
    @Body('deadline') deadline: number,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.increaseLiquidity(
        msgSender,
        tokenId,
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
          error: 'There was a problem increaseLiquidity in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyCollect')
  async easyCollect(
    @Body('msgSender') msgSender: string,
    @Body('tokenId') tokenId: number,
    @Body('amount0Max') amount0Max: number,
    @Body('amount1Max') amount1Max: number,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.easyCollect(
        msgSender,
        tokenId,
        amount0Max,
        amount1Max,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem increaseLiquidity in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyCompound')
  async easyCompound(
    @Body('msgSender') msgSender: string,
    @Body('tokenId') tokenId: number,
    @Body('amount0CollectMax') amount0CollectMax: number,
    @Body('amount1CollectMax') amount1CollectMax: number,
    @Body('amount0LiquidityMin') amount0LiquidityMin: number,
    @Body('amount1LiquidityMin') amount1LiquidityMin: number,
    @Body('deadline') deadline: number,
  ): Promise<bigint[]> {
    try {
      const result = await this.poolV3Service.easyCompound(
        msgSender,
        tokenId,
        amount0CollectMax,
        amount1CollectMax,
        amount0LiquidityMin,
        amount1LiquidityMin,
        deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem with easyCompound in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyDecreaseLiquidityCollect')
  async easyDecreaseLiquidityCollect(
    @Body('msgSender') msgSender: string,
    @Body('tokenId') tokenId: number,
    @Body('liquidity') liquidity: string,
    @Body('amount0LiquidityMin') amount0LiquidityMin: number,
    @Body('amount1LiquidityMin') amount1LiquidityMin: number,
    @Body('amount0CollectMax') amount0CollectMax: number,
    @Body('amount1CollectMax') amount1CollectMax: number,
    @Body('deadline') deadline: number,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.easyDecreaseLiquidityCollect(
        msgSender,
        tokenId,
        liquidity,
        amount0LiquidityMin,
        amount1LiquidityMin,
        amount0CollectMax,
        amount1CollectMax,
        deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem easyDecreaseLiquidityCollect in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyIncreaseLiquidityCompound')
  async easyIncreaseLiquidityCompound(
    @Body('msgSender') msgSender: string,
    @Body('tokenId') tokenId: number,
    @Body('amount0LiquidityDesired') amount0LiquidityDesired: string,
    @Body('amount1LiquidityDesired') amount1LiquidityDesired: string,
    @Body('amount0LiquidityMin') amount0LiquidityMin: number,
    @Body('amount1LiquidityMin') amount1LiquidityMin: number,
    @Body('amount0CollectMax') amount0CollectMax: number,
    @Body('amount1CollectMax') amount1CollectMax: number,
    @Body('deadline') deadline: number,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.easyIncreaseLiquidityCompound(
        msgSender,
        tokenId,
        amount0LiquidityDesired,
        amount1LiquidityDesired,
        amount0LiquidityMin,
        amount1LiquidityMin,
        amount0CollectMax,
        amount1CollectMax,
        deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem easyIncreaseLiquidityCompound in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyDecreaseLiquidityCollectAll')
  async easyDecreaseLiquidityCollectAll(
    @Body('msgSender') msgSender: string,
    @Body('tokenId') tokenId: number,
    @Body('liquidity') liquidity: string,
    @Body('amount0LiquidityMin') amount0LiquidityMin: number,
    @Body('amount1LiquidityMin') amount1LiquidityMin: number,
    @Body('deadline') deadline: number,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.easyDecreaseLiquidityCollectAll(
        msgSender,
        tokenId,
        liquidity,
        amount0LiquidityMin,
        amount1LiquidityMin,
        deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem easyDecreaseLiquidityCollectAll in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyDecreaseLiquidityAllCollectAllBurn')
  async easyDecreaseLiquidityAllCollectAllBurn(
    @Body('msgSender') msgSender: string,
    @Body('tokenId') tokenId: number,
    @Body('deadline') deadline: number,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.easyDecreaseLiquidityAllCollectAllBurn(
        msgSender,
        tokenId,
        deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem easyDecreaseLiquidityAllCollectAllBurn in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyStrategyChangeAll')
  async easyStrategyChangeAll(
    @Body('msgSender') msgSender: string,
    @Body('tokenId') tokenId: number,
    @Body('fee') fee: number, // 3000 => 0.3%
    @Body('tickLower') tickLower: number,
    @Body('tickUpper') tickUpper: number,
    @Body('amount0MintDesired') amount0MintDesired: number,
    @Body('amount1MintDesired') amount1MintDesired: number,
    @Body('amount0MintMin') amount0MintMin: number,
    @Body('amount1MintMin') amount1MintMin: number,
    @Body('deadline') deadline: number,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.easyStrategyChangeAll(
        msgSender,
        tokenId,
        fee,
        tickLower,
        tickUpper,
        amount0MintDesired,
        amount1MintDesired,
        amount0MintMin,
        amount1MintMin,
        deadline
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem easyStrategyChangeAll in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
