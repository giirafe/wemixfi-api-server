import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Account, TransferTx } from '../database/database.model';
import { ethers } from 'ethers';
import { AccountService } from 'src/account/account.service';

@Injectable()
export class LendAndBorrowService {
    constructor(
        private databaseService: DatabaseService,
        private accountService : AccountService,
    ) {}
    private readonly logger = new Logger(LendAndBorrowService.name);

    
    

}
