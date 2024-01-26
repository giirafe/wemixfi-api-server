import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class EasyMintDto {
  @IsString()
  msgSender: string;

  @IsString()
  token0: string;

  @IsString()
  token1: string;

  @IsNumber()
  fee: number;

  @IsNumber()
  tickLower: number;

  @IsNumber()
  tickUpper: number;

  @IsNumber()
  amount0Desired: number;

  @IsNumber()
  amount1Desired: number;

  @IsNumber()
  amount0Min: number;

  @IsNumber()
  amount1Min: number;

  @IsNumber()
  deadline: number;
}

export class IncreaseLiquidityDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  tokenId: number;

  @IsNumber()
  amount0Desired: number;

  @IsNumber()
  amount1Desired: number;

  @IsNumber()
  amount0Min: number;

  @IsNumber()
  amount1Min: number;

  @IsNumber()
  deadline: number;
}

export class EasyCollectDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  tokenId: number;

  @IsNumber()
  amount0Max: number;

  @IsNumber()
  amount1Max: number;
}

export class EasyCompoundDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  tokenId: number;

  @IsNumber()
  amount0CollectMax: number;

  @IsNumber()
  amount1CollectMax: number;

  @IsNumber()
  amount0LiquidityMin: number;

  @IsNumber()
  amount1LiquidityMin: number;

  @IsNumber()
  deadline: number;
}

export class EasyDecreaseLiquidityCollectDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  tokenId: number;

  @IsString()
  liquidity: string; // Adjust the type if necessary

  @IsNumber()
  amount0LiquidityMin: number;

  @IsNumber()
  amount1LiquidityMin: number;

  @IsNumber()
  amount0CollectMax: number;

  @IsNumber()
  amount1CollectMax: number;

  @IsNumber()
  deadline: number;
}

export class EasyIncreaseLiquidityCompoundDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  tokenId: number;

  @IsString()
  amount0LiquidityDesired: string; // Adjust the type if necessary

  @IsString()
  amount1LiquidityDesired: string; // Adjust the type if necessary

  @IsNumber()
  amount0LiquidityMin: number;

  @IsNumber()
  amount1LiquidityMin: number;

  @IsNumber()
  amount0CollectMax: number;

  @IsNumber()
  amount1CollectMax: number;

  @IsNumber()
  deadline: number;
}

export class EasyDecreaseLiquidityCollectAllDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  tokenId: number;

  @IsString()
  liquidity: string; // Adjust the type if necessary

  @IsNumber()
  amount0LiquidityMin: number;

  @IsNumber()
  amount1LiquidityMin: number;

  @IsNumber()
  deadline: number;
}

export class EasyDecreaseLiquidityAllCollectAllBurnDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  tokenId: number;

  @IsNumber()
  deadline: number;
}

export class EasyStrategyChangeAllDto {
  @IsNotEmpty()
  msgSender: string;

  @IsNumber()
  @IsNotEmpty()
  tokenId: number;

  @IsNumber()
  @IsNotEmpty()
  fee: number; // 3000 => 0.3%

  @IsNumber()
  @IsNotEmpty()
  tickLower: number;

  @IsNumber()
  @IsNotEmpty()
  tickUpper: number;

  @IsNumber()
  @IsNotEmpty()
  amount0MintDesired: number;

  @IsNumber()
  @IsNotEmpty()
  amount1MintDesired: number;

  @IsNumber()
  @IsNotEmpty()
  amount0MintMin: number;

  @IsNumber()
  @IsNotEmpty()
  amount1MintMin: number;

  @IsNumber()
  @IsNotEmpty()
  deadline: number;
}
