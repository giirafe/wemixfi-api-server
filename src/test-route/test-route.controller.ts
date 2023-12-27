import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TestRouteService } from './test-route.service';
import { AccountDocument } from './test-route.schema';
import { ethers } from 'ethers';

@Controller('test-route')
export class TestRouteController {
    constructor(private testRouteService: TestRouteService) {}

    @Post()
    setAccount(
        @Body('accountAddress') accountAddress : string,
        @Body('privateKey') privateKey : string
    ) : Promise<AccountDocument> {
        return this.testRouteService.setAccount(accountAddress, privateKey);
    }

    @Get()
    getAccountAll() : Promise<AccountDocument[]> {
        return this.testRouteService.getAccountAll();
    }

    @Get(':accountAddress')
    getAccount(@Param('accountAddress') accountAddress : string) : Promise<AccountDocument> {
        return this.testRouteService.getAccount(accountAddress);
    }

    // Getting ETH balance of certain address account
    @Get('balance/:address')
    async addressBalance(@Param('address') address: string): Promise<number> {
      return await this.testRouteService.getBalance(address);
    }

    @Post('transferWemix')
    async transferWemix(
        @Body('senderAddress') senderAddress :string,
        @Body('receiverAddress') receiverAddress :string,
        @Body('amount') amount :number,
    ) : Promise<ethers.TransactionReceipt> {
        return await this.testRouteService.transferWemix(senderAddress,receiverAddress,amount);
    }
}
