import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TestRouteService } from './test-route.service';
import { AccountDocument } from './test-route.schema';

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
}
