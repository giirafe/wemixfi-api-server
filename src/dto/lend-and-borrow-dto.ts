import { IsString, IsNumber, Min } from 'class-validator';

export class AccountSnapshotDto {
  @IsString({ message: 'Account address must be a string.' })
  accountAddress: string;
}

export class DepositAssetDto {
  @IsString({ message: 'Sender address must be a string.' })
  senderAddress: string;

  @IsNumber({}, { message: 'Amount must be a number.' })
  @Min(0, { message: 'Amount must be greater than or equal to 0.' })
  amount: number;

  @IsString({ message: 'Asset address must be a string.' })
  assetAddress: string;
}

export class BorrowAssetDto {
  @IsString({ message: 'Borrower address must be a string.' })
  borrowerAddress: string;

  @IsNumber({}, { message: 'Amount must be a number.' })
  @Min(0, { message: 'Amount must be greater than or equal to 0.' })
  amount: number;

  @IsString({ message: 'Asset address must be a string.' })
  assetAddress: string;
}

export class LiquidateAssetDto {
  @IsString({ message: 'Liquidator address must be a string.' })
  liquidatorAddress: string;

  @IsString({ message: 'Borrower address must be a string.' })
  borrowerAddress: string;

  @IsNumber({}, { message: 'Repay amount must be a number.' })
  @Min(0, { message: 'Repay amount must be greater than or equal to 0.' })
  repayAmount: number;

  @IsString({ message: 'Liquidate asset address must be a string.' })
  liquidateAssetAddress: string;

  @IsString({ message: 'Collateral address must be a string.' })
  collateralAddress: string;
}
