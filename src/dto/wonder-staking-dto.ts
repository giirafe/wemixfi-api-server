import { IsBoolean, IsNumber, IsString, Min } from 'class-validator';

export class DepositDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  pid: number;

  @IsNumber()
  amount: number;

  @IsString()
  to: string;

  @IsBoolean()
  claimReward: boolean;

  @IsBoolean()
  comp: boolean;
}

export class ClaimDto {
  @IsString()
  msgSender: string; // AddressLike type in ethers, but string for validation

  @IsNumber()
  pid: number; // BigNumberish in ethers, but number for simplicity

  @IsString()
  to: string; // AddressLike type in ethers, but string for validation
}

export class WithdrawRequestDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  pid: number;

  @IsNumber()
  toPid: number;

  @IsNumber()
  @Min(0,{message:'amount must be bigger than 0'})
  amount: number;

  @IsString()
  to: string;

  @IsBoolean()
  claimReward: boolean;

  @IsBoolean()
  comp: boolean;
}

export class WithdrawDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  pid: number;

  @IsNumber()
  tokenId: number;

  @IsString()
  to: string;
}

export class ChangeNCPDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  pid: number;

  @IsNumber()
  toPid: number;

  @IsNumber()
  tokenId: number;

  @IsString()
  to: string;

  @IsBoolean()
  claimReward: boolean;

  @IsBoolean()
  cancle: boolean;
}

export class WithdrawAllDto {
  @IsString()
  msgSender: string;

  @IsString()
  to: string;
}

export class WithdrawAllWithPidDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  pid: number;

  @IsString()
  to: string;
}

