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
import { WonderStakingService } from './wonder-staking.service';
// Import DTOs later
import {
  ChangeNCPDto,
  ClaimDto,
  DepositDto,
  WithdrawAllDto,
  WithdrawAllWithPidDto,
  WithdrawDto,
  WithdrawRequestDto,
} from 'src/dto/wonder-staking-dto';
import { AddressLike } from 'ethers/lib.commonjs/ethers';

@Controller('wonder-staking')
export class WonderStakingController {
  constructor(private wonderStakingService: WonderStakingService) {}

  @Get('getPlatformFeeRatio')
  async getPlatformFeeRatio() {
    try {
      const result = await this.wonderStakingService.getPlatformFeeRatio();
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getting position info in Wonder Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('getUserInfo')
  async getUserInfo(
    @Query('pid') pid: number,
    @Query('account') account: AddressLike,
  ) {
    try {
      const result = await this.wonderStakingService.getUserInfo(pid, account);
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getUserInfo in Wonder Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Handling Deposit related
  @Post('deposit')
  async deposit(@Body() depositDto: DepositDto) {
    try {
      const result = await this.wonderStakingService.deposit(
        depositDto.msgSender,
        depositDto.pid,
        depositDto.amount,
        depositDto.to,
        depositDto.claimReward,
        depositDto.comp,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem with the deposit in Wonder Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Handling Withdraw related
  @Post('withdrawRequest')
  async withdrawRequest(@Body() withdrawRequestDto: WithdrawRequestDto) {
    try {
      const result = await this.wonderStakingService.withdrawRequest(
        withdrawRequestDto.msgSender,
        withdrawRequestDto.pid,
        withdrawRequestDto.toPid,
        withdrawRequestDto.amount,
        withdrawRequestDto.to,
        withdrawRequestDto.claimReward,
        withdrawRequestDto.comp,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem with the withdrawal request in Wonder Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('withdraw')
  async withdraw(@Body() withdrawDto: WithdrawDto) {
    try {
      const result = await this.wonderStakingService.withdraw(
        withdrawDto.msgSender,
        withdrawDto.pid,
        withdrawDto.tokenId,
        withdrawDto.to,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem with the withdrawal in Wonder Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('changeNcp')
  async changeNCP(@Body() changeNCPDto: ChangeNCPDto) {
    try {
      const result = await this.wonderStakingService.changeNCP(
        changeNCPDto.msgSender,
        changeNCPDto.pid,
        changeNCPDto.toPid,
        changeNCPDto.tokenId,
        changeNCPDto.to,
        changeNCPDto.claimReward,
        changeNCPDto.cancle,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem with the NCP change in Wonder Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('withdrawAll')
  async withdrawAll(@Body() withdrawAllDto: WithdrawAllDto) {
    // Assuming the existence of WithdrawAllDto
    try {
      const result = await this.wonderStakingService.withdrawAll(
        withdrawAllDto.msgSender,
        withdrawAllDto.to,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem with the withdraw all operation in Wonder Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('withdrawAllWithPid')
  async withdrawAllWithPid(
    @Body() withdrawAllWithPidDto: WithdrawAllWithPidDto,
  ) {
    // Assuming the existence of WithdrawAllWithPidDto
    try {
      const result = await this.wonderStakingService.withdrawAllWithPid(
        withdrawAllWithPidDto.msgSender,
        withdrawAllWithPidDto.pid,
        withdrawAllWithPidDto.to,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error:
            'There was a problem with the withdraw all with pid operation in Wonder Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Handling Reward related
  @Post('claim')
  async claim(@Body() claimDto: ClaimDto) {
    try {
      const result = await this.wonderStakingService.claim(
        claimDto.msgSender,
        claimDto.pid,
        claimDto.to,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem with the claim in Wonder Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('compound')
  async compound(@Body() compoundDto: ClaimDto) {
    // compoundDto has the same format of ClaimDto thus reusing it.
    try {
      const result = await this.wonderStakingService.compound(
        compoundDto.msgSender,
        compoundDto.pid,
        compoundDto.to,
      );
      return result;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem with the compound in Wonder Staking',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
