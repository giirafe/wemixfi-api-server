import { IsNumber, IsString } from 'class-validator';

export class AddLiquidityDto {
  @IsString()
  msgSender: string;

  @IsString()
  tokenA: string;

  @IsString()
  tokenB: string;

  @IsNumber()
  amountADesired: number;

  @IsNumber()
  amountBDesired: number;

  @IsNumber()
  amountAMin: number;

  @IsNumber()
  amountBMin: number;

  @IsString()
  to: string;

  @IsNumber()
  deadline: number;
}

export class AddLiquidityWEMIXDto {
    @IsString()
    msgSender: string;
  
    @IsString()
    token: string;
  
    @IsNumber()
    amountTokenDesired: number;
  
    @IsNumber()
    amountWEMIXDesired: number;
  
    @IsNumber()
    amountTokenMin: number;
  
    @IsNumber()
    amountWEMIXMin: number;
  
    @IsString()
    to: string;
  
    @IsNumber()
    deadline: number;
  }
  
  export class RemoveLiquidityDto {
    @IsString()
    msgSender: string;
  
    @IsString()
    tokenA: string;
  
    @IsString()
    tokenB: string;
  
    @IsNumber()
    liquidity: number;
  
    @IsNumber()
    amountAMin: number;
  
    @IsNumber()
    amountBMin: number;
  
    @IsString()
    to: string;
  
    @IsNumber()
    deadline: number;
  }
  
  export class RemoveLiquidityWEMIXDto {
    @IsString()
    msgSender: string;
  
    @IsString()
    token: string;
  
    @IsNumber()
    liquidity: number;
  
    @IsNumber()
    amountTokenMin: number;
  
    @IsNumber()
    amountWEMIXMin: number;
  
    @IsString()
    to: string;
  
    @IsNumber()
    deadline: number;
  }
  