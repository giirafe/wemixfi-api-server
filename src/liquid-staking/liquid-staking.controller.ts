import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LiquidStakingService } from './liquid-staking.service';
// Import DTOs later
import {
  RewardOfDto,
  DepositDto,
  WithdrawDto,
} from 'src/dto/liquid-staking-dto';

@Controller('liquid-staking')
export class LiquidStakingController {
  constructor(private liquidStakingService: LiquidStakingService) {}

  @Get('getTotalPooledWEMIXWithFee')
  async getTotalPooledWEMIXWithFee() {
    try {
      const result =
        await this.liquidStakingService.getTotalPooledWEMIXWithFee();
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem getting Total Pooled WEMIX with Fee info in Liquid Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('rewardOf')
  async rewardOf(@Query() params: RewardOfDto) {
    try {
      const result = await this.liquidStakingService.rewardOf(params.msgSender);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getting rewardOf info in Liquid Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('deposit')
  async deposit(@Body() dto: DepositDto) {
    try {
      const result = await this.liquidStakingService.deposit(
        dto.msgSender,
        dto.amount,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem Depositing in Liquid Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('withdraw')
  async withdraw(@Body() dto: WithdrawDto) {
    try {
      const result = await this.liquidStakingService.withdraw(
        dto.msgSender,
        dto.amount,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem Withdrawing with Fee info in Liquid Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
