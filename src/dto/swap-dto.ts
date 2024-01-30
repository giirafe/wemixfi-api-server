import {
  IsNumber,
  IsString,
  IsArray,
  ArrayNotEmpty,
  IsNumberString,
} from 'class-validator';

export class QuoteDto {
  @IsNumberString()
  amount: number;

  @IsNumberString()
  reserveA: number;

  @IsNumberString()
  reserveB: number;
}

export class AmountOutDto {
  @IsNumberString()
  amountIn: number;

  @IsNumberString()
  reserveIn: number;

  @IsNumberString()
  reserveOut: number;
}

export class AmountInDto {
  @IsNumberString()
  amountOut: number;

  @IsNumberString()
  reserveIn: number;

  @IsNumberString()
  reserveOut: number;
}

export class AmountsOutDto {
  @IsNumberString()
  amountIn: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  path: string[];
}

export class AmountsInDto {
  @IsNumberString()
  amountOut: number;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  path: string[];
}

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

export class SwapExactTokensForTokensDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  amountIn: number;

  @IsNumber()
  amountOutMin: number;

  @IsArray()
  @IsString({ each: true })
  path: string[];

  @IsString()
  to: string;

  @IsNumber()
  deadline: number;
}

export class SwapTokensForExactTokensDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  amountOut: number;

  @IsNumber()
  amountInMax: number;

  @IsArray()
  @IsString({ each: true })
  path: string[];

  @IsString()
  to: string;

  @IsNumber()
  deadline: number;
}

export class SwapExactWEMIXForTokensDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  amountIn: number;

  @IsNumber()
  amountOutMin: number;

  @IsArray()
  @IsString({ each: true })
  path: string[];

  @IsString()
  to: string;

  @IsNumber()
  deadline: number;
}

export class SwapTokensForExactWEMIXDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  amountOut: number;

  @IsNumber()
  amountInMax: number;

  @IsArray()
  @IsString({ each: true })
  path: string[];

  @IsString()
  to: string;

  @IsNumber()
  deadline: number;
}

export class SwapExactTokensForWEMIXDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  amountIn: number;

  @IsNumber()
  amountOutMin: number;

  @IsArray()
  @IsString({ each: true })
  path: string[];

  @IsString()
  to: string;

  @IsNumber()
  deadline: number;
}

export class SwapWEMIXForExactTokensDto {
  @IsString()
  msgSender: string;

  @IsNumber()
  amountOut: number;

  @IsNumber()
  amountInMax: number;

  @IsArray()
  @IsString({ each: true })
  path: string[];

  @IsString()
  to: string;

  @IsNumber()
  deadline: number;
}
