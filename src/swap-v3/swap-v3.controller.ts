import {
    Controller,
    Post,
    Body,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
import { SwapV3Service } from './swap-v3.service';
import { ExactInputDto } from 'src/dto/swap-v3-dto';
@Controller('swap-v3')
export class SwapV3Controller {
    constructor(private swapV3Service: SwapV3Service) {}

    @Post('exactInput')
    async exactInput(@Body() dto:ExactInputDto): Promise<any> {
        try {
            const result = await this.swapV3Service.exactInput(
                dto.msgSender,
                dto.tokenIn,
                dto.tokenOut,
                dto.recipient,
                dto.deadline,
                dto.amountIn,
                dto.amountOutMinimum
            )
            return result;
        } catch (error) {
            throw new HttpException(
                {
                    status: HttpStatus.INTERNAL_SERVER_ERROR,
                    error: 'There was a problem exactInput in Swap V3',
                    details: error.message,
                },
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
