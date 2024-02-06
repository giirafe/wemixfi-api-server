import { IsNumber, IsString } from 'class-validator';

export class RewardOfDto {
  @IsString()
  msgSender: string; // AddressLike type in ethers, but string for validation
}

export class DepositDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  amount: number;
}

export class WithdrawDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  amount: number;
}
