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
import {
  EasyCollectDto,
  EasyCompoundDto,
  EasyDecreaseLiquidityAllCollectAllBurnDto,
  EasyDecreaseLiquidityCollectAllDto,
  EasyDecreaseLiquidityCollectDto,
  EasyIncreaseLiquidityCompoundDto,
  EasyMintDto,
  EasyStrategyChangeAllDto,
  IncreaseLiquidityDto,
} from 'src/dto/pool-v3-dto';

@Controller('pool-v3')
export class PoolV3Controller {
  constructor(private poolV3Service: PoolV3Service) {}

  @Get('positionInfo')
  async getPositionInfo(@Query('tokenId') tokenId: number) {
    try {
      const result = await this.poolV3Service.getPositionInfo(tokenId);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem getting position info in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyMint')
  async easyMint(@Body() dto: EasyMintDto): Promise<any> {
    try {
      const result = await this.poolV3Service.easyMint(
        dto.msgSender,
        dto.token0,
        dto.token1,
        dto.fee,
        dto.tickLower,
        dto.tickUpper,
        dto.amount0Desired,
        dto.amount1Desired,
        dto.amount0Min,
        dto.amount1Min,
        dto.deadline,
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
  async increaseLiquidity(@Body() dto: IncreaseLiquidityDto): Promise<any> {
    try {
      const result = await this.poolV3Service.increaseLiquidity(
        dto.msgSender,
        dto.tokenId,
        dto.amount0Desired,
        dto.amount1Desired,
        dto.amount0Min,
        dto.amount1Min,
        dto.deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem increasing liquidity in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyCollect')
  async easyCollect(@Body() dto: EasyCollectDto): Promise<any> {
    try {
      const result = await this.poolV3Service.easyCollect(
        dto.msgSender,
        dto.tokenId,
        dto.amount0Max,
        dto.amount1Max,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem with easyCollect in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyCompound')
  async easyCompound(@Body() dto: EasyCompoundDto): Promise<bigint[]> {
    try {
      const result = await this.poolV3Service.easyCompound(
        dto.msgSender,
        dto.tokenId,
        dto.amount0CollectMax,
        dto.amount1CollectMax,
        dto.amount0LiquidityMin,
        dto.amount1LiquidityMin,
        dto.deadline,
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
    @Body() dto: EasyDecreaseLiquidityCollectDto,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.easyDecreaseLiquidityCollect(
        dto.msgSender,
        dto.tokenId,
        dto.liquidity,
        dto.amount0LiquidityMin,
        dto.amount1LiquidityMin,
        dto.amount0CollectMax,
        dto.amount1CollectMax,
        dto.deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem with easyDecreaseLiquidityCollect in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyIncreaseLiquidityCompound')
  async easyIncreaseLiquidityCompound(
    @Body() dto: EasyIncreaseLiquidityCompoundDto,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.easyIncreaseLiquidityCompound(
        dto.msgSender,
        dto.tokenId,
        dto.amount0LiquidityDesired,
        dto.amount1LiquidityDesired,
        dto.amount0LiquidityMin,
        dto.amount1LiquidityMin,
        dto.amount0CollectMax,
        dto.amount1CollectMax,
        dto.deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem with easyIncreaseLiquidityCompound in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyDecreaseLiquidityCollectAll')
  async easyDecreaseLiquidityCollectAll(
    @Body() dto: EasyDecreaseLiquidityCollectAllDto,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.easyDecreaseLiquidityCollectAll(
        dto.msgSender,
        dto.tokenId,
        dto.liquidity,
        dto.amount0LiquidityMin,
        dto.amount1LiquidityMin,
        dto.deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem with easyDecreaseLiquidityCollectAll in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyDecreaseLiquidityAllCollectAllBurn')
  async easyDecreaseLiquidityAllCollectAllBurn(
    @Body() dto: EasyDecreaseLiquidityAllCollectAllBurnDto,
  ): Promise<any> {
    try {
      const result =
        await this.poolV3Service.easyDecreaseLiquidityAllCollectAllBurn(
          dto.msgSender,
          dto.tokenId,
          dto.deadline,
        );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem with easyDecreaseLiquidityAllCollectAllBurn in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('easyStrategyChangeAll')
  async easyStrategyChangeAll(
    @Body() dto: EasyStrategyChangeAllDto,
  ): Promise<any> {
    try {
      const result = await this.poolV3Service.easyStrategyChangeAll(
        dto.msgSender,
        dto.tokenId,
        dto.fee,
        dto.tickLower,
        dto.tickUpper,
        dto.amount0MintDesired,
        dto.amount1MintDesired,
        dto.amount0MintMin,
        dto.amount1MintMin,
        dto.deadline,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem with easyStrategyChangeAll in Pool V3(Swap V3)',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
