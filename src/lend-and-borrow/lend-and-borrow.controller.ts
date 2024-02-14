import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LendAndBorrowService } from './lend-and-borrow.service';
import { ethers } from 'ethers';
import {
  AccountSnapshotDto,
  DepositAssetDto,
  BorrowAssetDto,
  LiquidateAssetDto,
} from 'src/dto/lend-and-borrow-dto';

@Controller('lend-and-borrow')
export class LendAndBorrowController {
  constructor(private lendAndBorrowService: LendAndBorrowService) {}

  @Get('snapshotWemix')
  async getAccountSnapshot(
    @Query() params: AccountSnapshotDto,
  ): Promise<any> {
    try {
      return await this.lendAndBorrowService.getAccountSnapshot(
        params.accountAddress,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getting the account snapshot',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('liquidationInfo')
  async getLiquidationInfo(
    @Query() params: AccountSnapshotDto,
  ): Promise<any> {
    try {
      return await this.lendAndBorrowService.getLiquidationInfo(
        params.accountAddress,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'There was a problem getting the liquidation info',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('depositAsset')
  async depositAsset(
    @Body() dto: DepositAssetDto,
  ): Promise<ethers.TransactionReceipt> {
    try {
      return await this.lendAndBorrowService.depositAsset(
        dto.senderAddress,
        dto.amount,
        dto.assetAddress,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'There was a problem with the deposit',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('borrowAsset')
  async borrowAsset(
    @Body() dto: BorrowAssetDto,
  ): Promise<ethers.TransactionReceipt> {
    try {
      return await this.lendAndBorrowService.borrowAsset(
        dto.borrowerAddress,
        dto.amount,
        dto.assetAddress,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'There was a problem with the Borrowing',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('liquidateAsset')
  async liquidateAsset(
    @Body() dto: LiquidateAssetDto,
  ): Promise<ethers.TransactionReceipt> {
    try {
      return await this.lendAndBorrowService.liquidateAsset(
        dto.liquidatorAddress,
        dto.borrowerAddress,
        dto.repayAmount,
        dto.liquidateAssetAddress,
        dto.collateralAddress,
      );
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.BAD_REQUEST,
          error: 'There was a problem with the Liquidating',
          details: error.message,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
