import { IsString, IsNumber, IsNotEmpty, IsHexadecimal, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ExactInputDto {
  @IsString()
  @IsNotEmpty()
  msgSender: string; // Using string type for addresses, assuming they will be in hex format

  @IsString()
  @IsNotEmpty()
  tokenIn: string;

  @IsString()
  @IsNotEmpty()
  tokenOut: string;

  @IsString()
  @IsNotEmpty()
  recipient: string; // Using string type for addresses, assuming they will be in hex format

  @IsNumber()
  @Type(() => Number) // Ensure the value is transformed to a number
  @Min(0)
  deadline: number; // Timestamps can be represented as numbers

  @IsNumber()
  @IsNotEmpty()
  amountIn: number; // BigNumberish can include large numbers, so it's safe to use strings and convert later

  @IsNumber()
  @IsNotEmpty()
  amountOutMinimum: number; // BigNumberish can include large numbers, so it's safe to use strings and convert later
}
