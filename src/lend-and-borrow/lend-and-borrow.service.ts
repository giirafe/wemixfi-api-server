import { Contract, ethers } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';

// const cWemixJson = require( '../../wemixFi_env') // importing CWemix.json for ABI
import * as cWemixJson from '../../wemixFi_env/CWemix.json'
import { CWemix } from '../../types/ethers/CWemix';

import * as cWemixDollarJson from '../../wemixFi_env/CWemixDollar.json'
import { CWemixDollar } from '../../types/ethers/CWemixDollar';

import * as cstWemixJson from '../../wemixFi_env/CstWemix.json'
import { CstWemix } from '../../types/ethers/CstWemix';

@Injectable()
export class LendAndBorrowService {

    // Since I'm testing on dev.wemixfi, can't use the real Smart Contract used on wemixFi
    private readonly cWemixAddress = '0x3eBda066925BBc790FE198F47ef650Ddb764EcfE'; // cEth.sol
    private readonly cWemixDollarAddress = "0x487B9C58fFB0a1196790b4189176d3A419Ab1D24"; // cErc20.sol

    private cWemixContract: CWemix;
    private readonly cWemixContractABI = cWemixJson.abi;

    private cWemixDollarContract : CWemixDollar;
    private readonly cWemixDollarContractABI = cWemixDollarJson.abi;

    constructor(
        private databaseService: DatabaseService,
        private accountService: AccountService,
    ) {
        const provider = this.databaseService.provider();
        this.cWemixContract = new ethers.Contract(this.cWemixAddress, this.cWemixContractABI, provider) as unknown as CWemix; // Contract converted to CWemix 
        this.cWemixDollarContract = new ethers.Contract(this.cWemixDollarAddress, this.cWemixDollarContractABI, provider) as unknown as CWemixDollar; // Contract converted to CWemixDollar
    }

    private readonly logger = new Logger(LendAndBorrowService.name);

    async getAccountSnapshot(address:string) : Promise<string []> {
        const senderWallet = await this.accountService.getAddressWallet(address);
        try {
            const accountSnapshot = await this.cWemixContract.connect(senderWallet).getAccountSnapshot(address);
            this.logger.debug('Snapshot returning 1.Error Code 2. cTokenBalance 3. borrowBalance 4. exchageRateMantissa ')
            // Additional conversion of bigInt to string required for JSON format
            return accountSnapshot.map(bigIntValue => bigIntValue.toString());
            // return accountSnapshot;
        } catch(error) {
            this.logger.error('Error while getAccountSnapshot in lend-and-borrow.service.ts : ', error);
            throw error;
        }
    }

    async depositWemix(senderAddress: string, amount: number): Promise<ethers.TransactionReceipt> {

        const senderWallet = await this.accountService.getAddressWallet(senderAddress);
        const amountInWei = ethers.parseEther(amount.toString());

        try {
            const txResult = await this.cWemixContract.connect(senderWallet).mint({value:amountInWei});

            return await txResult.wait();
        } catch (error) {
            this.logger.error('Error while deposit in lend-and-borrow.service.ts :', error);
            throw error;
        }
    }

    async borrowWemixDollar(borrowerAddress:string, borrowAmount: number) : Promise<ethers.TransactionReceipt> {
        const senderWallet = await this.accountService.getAddressWallet(borrowerAddress);
        const amountInWei = ethers.parseEther(borrowAmount.toString());

        try {
            const txResult = await this.cWemixDollarContract.connect(senderWallet).borrow(amountInWei); // CErc20.sol

            return await txResult.wait();
        } catch (error) {
            this.logger.error('Error while borrowWemixDollar in lend-and-borrow.service.ts :', error);
            throw error;
        }
    }




}
