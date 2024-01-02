import { Contract, ethers } from 'ethers';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';
import { CWemix } from '../../types/ethers/CWemix';

const cWemixJson = require( '../../wemixFi_env/CWemix.json') // importing CWemix.json for ABI

@Injectable()
export class LendAndBorrowService {
    private readonly cWemixAddress = '0x3eBda066925BBc790FE198F47ef650Ddb764EcfE'; // Since I'm testing on dev.wemixfi, can't use the real Smart Contract used on wemixFi
    private cWemixContract: CWemix;
    private readonly cWemixContractABI = cWemixJson.abi;

    constructor(
        private databaseService: DatabaseService,
        private accountService: AccountService,
    ) {
        const provider = this.databaseService.provider();
        this.cWemixContract = new ethers.Contract(this.cWemixAddress, this.cWemixContractABI, provider) as unknown as CWemix; // Type
    }

    private readonly logger = new Logger(LendAndBorrowService.name);

    async lendAsset(senderAddress: string, assetAddress: string, amount: number): Promise<ethers.TransactionReceipt> {
        const senderPrivateKey = await this.databaseService.getAccountPrivateKey(senderAddress);
        if (!senderPrivateKey) {
            throw new Error('Sender account not found or private key is missing');
        }

        const wallet = new ethers.Wallet(senderPrivateKey, this.databaseService.provider());
        const amountInWei = ethers.parseEther(amount.toString());

        try {
            const txResult = await this.cWemixContract.connect(wallet).mint({value:amountInWei});

            return await txResult.wait();
        } catch (error) {
            this.logger.error('Error in lendAsset:', error);
            throw error;
        }
    }
}
