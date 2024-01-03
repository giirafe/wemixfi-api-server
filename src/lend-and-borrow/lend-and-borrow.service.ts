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


export enum AssetType {
    Wemix = 0,
    WemixDollar = 1,
    StWemix = 2
}

interface TransactionData {
    blockNumber: number;
    blockTimestamp: string;
    txHash: string;
    funcSig: string;
    from: string;
    to: string;
}

@Injectable()
export class LendAndBorrowService {

    // Since I'm testing on dev.wemixfi, can't use the real Smart Contract used on wemixFi
    private readonly cWemixAddress = '0x3eBda066925BBc790FE198F47ef650Ddb764EcfE'; // cEth.sol
    private readonly cWemixDollarAddress = "0x487B9C58fFB0a1196790b4189176d3A419Ab1D24"; // cErc20.sol
    private readonly cstWemixAddress = "0xA17EdCDC4D622a010C33697110cea13FEC0868FB";

    private cWemixContract: CWemix;
    private cWemixDollarContract : CWemixDollar;
    private cstWemixContract : CstWemix;

    private readonly cWemixContractABI = cWemixJson.abi;
    private readonly cWemixDollarContractABI = cWemixDollarJson.abi;
    private readonly cstWemixContractABI = cstWemixJson.abi;

    constructor(
        private databaseService: DatabaseService,
        private accountService: AccountService,
    ) {
        const provider = this.databaseService.provider();
        this.cWemixContract = new ethers.Contract(this.cWemixAddress, this.cWemixContractABI, provider) as unknown as CWemix; // Contract converted to CWemix 
        this.cWemixDollarContract = new ethers.Contract(this.cWemixDollarAddress, this.cWemixDollarContractABI, provider) as unknown as CWemixDollar; // Contract converted to CWemixDollar
        this.cstWemixContract =  new ethers.Contract(this.cstWemixAddress, this.cstWemixContractABI, provider) as unknown as CstWemix;
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

    async depositAsset(senderAddress: string, amount: number, assetType: AssetType): Promise<ethers.TransactionReceipt> {
        const senderWallet = await this.accountService.getAddressWallet(senderAddress);
        const amountInWei = ethers.parseEther(amount.toString());

        let contractName : string;
        const funcName : string = 'mint';
        let value : bigint = 0n; // Wemix amount sent with Tx
        let inputJson  = { senderAddress, amount, assetType}
        let input : string = JSON.stringify(inputJson)

        try {
            let txResult;
            switch (assetType) {
                case AssetType.Wemix:
                    txResult = await this.cWemixContract.connect(senderWallet).mint({ value: amountInWei });
                    value = amountInWei;
                    contractName = "CWemix";
                    break;
                case AssetType.WemixDollar:
                    // Assuming you have a method for depositing Wemix Dollar
                    txResult = await this.cWemixDollarContract.connect(senderWallet).mint(amountInWei);contractName = "CWemixDollar";
                    break;
                case AssetType.StWemix:
                    // Assuming you have a method for depositing StWemix
                    txResult = await this.cstWemixContract.connect(senderWallet).mint(amountInWei);
                    contractName = "CstWemix";
                    break;
                default:
                    throw new Error('Invalid asset type');
            }
            
            // .wait() : waits for the transaction to be mined and confirmed
            // due to the usage of .wait() which is a async work, await is required to resolve the Promise.
            const txReceipt = await txResult.wait();
            const extractedData = await this.extractTxDataFromReceipt(txReceipt);

            // Log the parameters for debugging
            // this.logger.debug('Parameters for logTxInfo:', {
            //     blockNumber: extractedData.blockNumber,
            //     blockTimestamp: extractedData.blockTimestamp,
            //     txHash: extractedData.txHash,
            //     contractName,
            //     funcName,
            //     funcSig: extractedData.funcSig,
            //     from: extractedData.from,
            //     to: extractedData.to,
            //     input: input,
            //     value: value.toString()
            // });

            // Call logTxInfo from DatabaseService
            await this.databaseService.logTxInfo(
                extractedData.blockNumber,
                extractedData.blockTimestamp,
                extractedData.txHash,
                contractName,
                funcName,
                extractedData.funcSig,
                extractedData.from,
                extractedData.to,
                input,
                value
            );

            return txReceipt;

        } catch (error) {
            this.logger.error('Error while depositAsset in lend-and-borrow.service.ts :', error);
            throw error;
        }
    }
    

    async borrowAsset(borrowerAddress: string, borrowAmount: number, assetType: AssetType): Promise<ethers.TransactionReceipt> {
        const senderWallet = await this.accountService.getAddressWallet(borrowerAddress);
        const amountInWei = ethers.parseEther(borrowAmount.toString());
    
        let contractName : string;
        const funcName : string = 'borrow';
        let value : bigint = 0n; // Wemix amount sent with Tx
        let inputJson  = { borrowerAddress, borrowAmount, assetType}
        let input : string = JSON.stringify(inputJson)

        try {
            let txResult;
            switch (assetType) {
                case AssetType.Wemix:
                    // Assuming you have a method for borrowing Wemix
                    txResult = await this.cWemixContract.connect(senderWallet).borrow(amountInWei);
                    value = amountInWei;
                    contractName = "CWemix";
                    break;
                case AssetType.WemixDollar:
                    // Approve cWemixDollarContract to approve certain amount for mint
                    await this.cWemixDollarContract.connect(senderWallet).approve(this.cWemixDollarAddress,amountInWei);
                    txResult = await this.cWemixDollarContract.connect(senderWallet).borrow(amountInWei);
                    contractName = "CWemixDollar";
                    break;
                case AssetType.StWemix:
                    // Also requires approval for mint
                    await this.cstWemixContract.connect(senderWallet).approve(this.cstWemixAddress,amountInWei);
                    txResult = await this.cstWemixContract.connect(senderWallet).borrow(amountInWei);
                    contractName = "CstWemix";
                    break;
                default:
                    throw new Error('Invalid asset type');
            }
    
            const txReceipt = await txResult.wait();
            const extractedData = await this.extractTxDataFromReceipt(txReceipt);

            // Call logTxInfo from DatabaseService
            await this.databaseService.logTxInfo(
                extractedData.blockNumber,
                extractedData.blockTimestamp,
                extractedData.txHash,
                contractName,
                funcName,
                extractedData.funcSig,
                extractedData.from,
                extractedData.to,
                input,
                value
            );

            return txReceipt;

        } catch (error) {
            this.logger.error('Error while borrowAsset in lend-and-borrow.service.ts :', error);
            throw error;
        }
    }

    async extractTxDataFromReceipt(txReceipt: ethers.TransactionReceipt): Promise<TransactionData> {
        // Extract basic data from receipt
        const blockNumber = txReceipt.blockNumber;
        const txHash = txReceipt.hash;
        const from = txReceipt.from;
        const to = txReceipt.to;
        const funcSig = txHash.slice(0, 10);

        // Get block details to extract the timestamp
        const block = await this.databaseService.provider().getBlock(blockNumber);
        const blockTimestamp = new Date(block.timestamp * 1000).toISOString(); // Convert timestamp to ISOString

        // Return the extracted data
        return {
            blockNumber,
            blockTimestamp,
            txHash,
            funcSig,
            from,
            to
        };
    }

}
