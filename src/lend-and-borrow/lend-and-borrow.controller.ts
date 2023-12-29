import { Controller, Post, Body, Get, Param, Res, Query } from '@nestjs/common';
// import { testRouteService } from './test-route.service';
import { DatabaseService } from '../database/database.service';
import { Account, TransferTx } from '../database/database.model';
import { ethers } from 'ethers';


@Controller('lend-and-borrow')
export class LendAndBorrowController {
    constructor(private databaseService: DatabaseService) {}

    
}
