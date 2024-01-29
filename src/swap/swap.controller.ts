import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SwapService } from './swap.service';
import {
  SwapExactTokensForTokensDto,
  SwapTokensForExactTokensDto,
  SwapExactWEMIXForTokensDto,
  SwapTokensForExactWEMIXDto,
  SwapExactTokensForWEMIXDto,
  SwapWEMIXForExactTokensDto,
  AmountInDto,
  AmountOutDto,
  AmountsInDto,
  AmountsOutDto,
  QuoteDto,
} from 'src/dto/swap-dto';

@Controller('swap')
export class SwapController {
  constructor(private swapService: SwapService) {}

  @Get('quote')
  async getQuote(@Query() dto: QuoteDto): Promise<bigint> {
    try {
      return await this.swapService.getQuote(
        dto.amount,
        dto.reserveA,
        dto.reserveB,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getting Quote in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('amountOut')
  async getAmountOut(@Query() dto: AmountOutDto): Promise<bigint> {
    try {
      return await this.swapService.getAmountOut(
        dto.amountIn,
        dto.reserveIn,
        dto.reserveOut,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getting AmountOut in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('amountIn')
  async getAmountIn(@Query() dto: AmountInDto): Promise<bigint> {
    try {
      return await this.swapService.getAmountIn(
        dto.amountOut,
        dto.reserveIn,
        dto.reserveOut,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getting AmountIn in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('amountsOut')
  async getAmountsOut(@Query() dto: AmountsOutDto): Promise<bigint[]> {
    try {
      return await this.swapService.getAmountsOut(dto.amountIn, dto.path);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getting AmountS Out in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('amountsIn')
  async getAmountsIn(@Query() dto: AmountsInDto): Promise<bigint[]> {
    try {
      return await this.swapService.getAmountsIn(dto.amountOut, dto.path);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getting AmountS In in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('swapExactTokensForTokens')
  async swapExactTokensForTokens(
    @Body() dto: SwapExactTokensForTokensDto,
  ): Promise<{ swapOutAmount: bigint; swapInAmount: bigint }> {
    try {
      return await this.swapService.swapExactTokensForTokens(
        dto.msgSender,
        dto.amountIn,
        dto.amountOutMin,
        dto.path,
        dto.to,
        dto.deadline,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem swapExactTokensForTokens in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('swapTokensForExactTokens')
  async swapTokensForExactTokens(
    @Body() dto: SwapTokensForExactTokensDto,
  ): Promise<{ swapOutAmount: bigint; swapInAmount: bigint }> {
    try {
      return await this.swapService.swapTokensForExactTokens(
        dto.msgSender,
        dto.amountOut,
        dto.amountInMax,
        dto.path,
        dto.to,
        dto.deadline,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem swapTokensForExactTokens in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('swapExactWEMIXForTokens')
  async swapExactWEMIXForTokens(
    @Body() dto: SwapExactWEMIXForTokensDto,
  ): Promise<{ swapOutAmount: bigint; swapInAmount: bigint }> {
    try {
      return await this.swapService.swapExactWEMIXForTokens(
        dto.msgSender,
        dto.amountIn,
        dto.amountOutMin,
        dto.path,
        dto.to,
        dto.deadline,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem swapExactWEMIXForTokens in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('swapTokensForExactWEMIX')
  async swapTokensForExactWEMIX(
    @Body() dto: SwapTokensForExactWEMIXDto,
  ): Promise<{ swapOutAmount: bigint; swapInAmount: bigint }> {
    try {
      return await this.swapService.swapTokensForExactWEMIX(
        dto.msgSender,
        dto.amountOut,
        dto.amountInMax,
        dto.path,
        dto.to,
        dto.deadline,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem swapTokensForExactWEMIX in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('swapExactTokensForWEMIX')
  async swapExactTokensForWEMIX(
    @Body() dto: SwapExactTokensForWEMIXDto,
  ): Promise<{ swapOutAmount: bigint; swapInAmount: bigint }> {
    try {
      return await this.swapService.swapExactTokensForWEMIX(
        dto.msgSender,
        dto.amountIn,
        dto.amountOutMin,
        dto.path,
        dto.to,
        dto.deadline,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem swapExactTokensForWEMIX in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('swapWEMIXForExactTokens')
  async swapWEMIXForExactTokens(
    @Body() dto: SwapWEMIXForExactTokensDto,
  ): Promise<{ swapOutAmount: bigint; swapInAmount: bigint }> {
    try {
      return await this.swapService.swapWEMIXForExactTokens(
        dto.msgSender,
        dto.amountOut,
        dto.amountInMax,
        dto.path,
        dto.to,
        dto.deadline,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem swap WEMIX For EXACT Tokens in Swap V2',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
