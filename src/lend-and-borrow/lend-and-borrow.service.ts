import { Injectable, Logger } from '@nestjs/common';
import { Contract, ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';

// const cWemixJson = require( '../../wemixFi_env') // importing CWemix.json for ABI
// User Interactions are handled on each asset's deployed contract. Thus process of instantiating each asset's contract is mandated
import * as cWemixJson from '../../wemixFi_env/CWemix.json'
import { CWemix } from '../../types/ethers/CWemix';

import * as cWemixDollarJson from '../../wemixFi_env/CWemixDollar.json'
import { CWemixDollar } from '../../types/ethers/CWemixDollar';

import * as cstWemixJson from '../../wemixFi_env/CstWemix.json'
import { CstWemix } from '../../types/ethers/CstWemix';

import * as wemixffiLendingViewJson from '../../wemixFi_env/WemixfiLendingView.json'
import { WemixfiLendingView, WemixfiLendingViewInterface } from '../../types/ethers/WemixfiLendingView';

import * as wemixfiControllerViewJson from '../../wemixFi_env/ControllerView.json'
import { ControllerView } from '../../types/ethers/ControllerView';

import * as wemixfi_addrs_dev from '../../wemixFi_env/wemixfi_addrs_dev.json'

// export enum AssetType {
//     Wemix = 0,
//     WemixDollar = 1,
//     StWemix = 2
// }

// Trying to set the enum type like below but type conversion error
// export enum AssetType {
//     Wemix = wemixfi_addrs_dev.cWemix as string,
//     WemixDollar = wemixfi_addrs_dev.cWemixDollar,
//     StWemix = wemixfi_addrs_dev.cstWemix
// }

export enum AssetType {
    Wemix = '0x3eBda066925BBc790FE198F47ef650Ddb764EcfE',
    WemixDollar = '0x487B9C58fFB0a1196790b4189176d3A419Ab1D24',
    StWemix = '0xA17EdCDC4D622a010C33697110cea13FEC0868FB'
}

interface ReceiptData {
    blockNumber: number;
    blockTimestamp: string;
    txHash: string;
    funcSig: string;
    from: string;
    to: string;
}

@Injectable()
export class LendAndBorrowService {

    // Since I'm testing on dev.wemixfi, can't use the real Smart Contract used on wemixFi, getting dev deployed smart contract addresses from wemixfi_addrs_dev.json
    private readonly cWemixAddress = wemixfi_addrs_dev.cWemix; // cEth.sol
    private readonly cWemixDollarAddress = wemixfi_addrs_dev.cWemixDollar; // cErc20.sol
    private readonly cstWemixAddress =  wemixfi_addrs_dev.cstWemix;
    private readonly wemixfiLendingViewAddress = wemixfi_addrs_dev.wemixfiLendingView;
    private readonly wemixfiControllerViewAddress = wemixfi_addrs_dev.controllerView;

    private cWemixContract: CWemix;
    private cWemixDollarContract : CWemixDollar;
    private cstWemixContract : CstWemix;
    private wemixfiLendingViewContract : WemixfiLendingView;
    private wemixfiControllerViewContract : ControllerView;

    private readonly cWemixContractABI = cWemixJson.abi;
    private readonly cWemixDollarContractABI = cWemixDollarJson.abi;
    private readonly cstWemixContractABI = cstWemixJson.abi;
    private readonly wemixfiLendingViewContractABI = wemixffiLendingViewJson.abi;
    private readonly wemixfiControllerViewContractABI = wemixfiControllerViewJson.abi;

    constructor(
        private databaseService: DatabaseService,
        private accountService: AccountService,
    ) {
        const provider = this.databaseService.provider();
        this.cWemixContract = new ethers.Contract(this.cWemixAddress, this.cWemixContractABI, provider) as unknown as CWemix; // Contract converted to CWemix 
        this.cWemixDollarContract = new ethers.Contract(this.cWemixDollarAddress, this.cWemixDollarContractABI, provider) as unknown as CWemixDollar; // Contract converted to CWemixDollar
        this.cstWemixContract =  new ethers.Contract(this.cstWemixAddress, this.cstWemixContractABI, provider) as unknown as CstWemix;
        this.wemixfiLendingViewContract =  new ethers.Contract(this.wemixfiLendingViewAddress, this.wemixfiLendingViewContractABI, provider) as unknown as WemixfiLendingView;
        this.wemixfiControllerViewContract =  new ethers.Contract(this.wemixfiControllerViewAddress, this.wemixfiControllerViewContractABI, provider) as unknown as ControllerView;
    }

    private readonly logger = new Logger(LendAndBorrowService.name);

    async getAccountSnapshot(address:string) : Promise<string []> {
        const senderWallet = await this.accountService.getAddressWallet(address);
        try {
            const accountSnapshot = await this.cWemixContract.connect(senderWallet).getAccountSnapshot(address);
            this.logger.debug('Snapshot returning 1.Error Code 2. cTokenBalance 3. borrowBalance 4. exchageRateMantissa ')
            // Additional conversion of bigInt to string required for JSON format
            return accountSnapshot.map(bigIntValue => bigIntValue.toString());
        } catch(error) {
            this.logger.error('Error while getAccountSnapshot in lend-and-borrow.service.ts : ', error);
            throw error;
        }
    }

    async getLiquidationInfo(
        accountAddress: string
    ): Promise<string> {
        try {
            const txResult = await this.wemixfiLendingViewContract.getLiquidationInfo(accountAddress);
    
            // Process the result to convert it into a suitable JSON object
            const liquidationInfo = {
                isLiquidateTarget: txResult.isLiquidateTarget,
                tokenInfo: txResult.tokenInfo.map(info => ({ // Mapping each token's info following JSON Format
                    underlyingTokenAddr: info.underlyingTokenAddr,
                    cTokenAddr: info.cTokenAddr,
                    isCollateralAsset: info.isCollateralAsset,
                    isBorrowAsset: info.isBorrowAsset,
                    price: info.price.toString(),
                    repayAmountMax: info.repayAmountMax.toString(),
                    collateralUnderlyingTokenAmount: info.collateralUnderlyingTokenAmount.toString(),
                }))
            };
    
            // Convert the object to a JSON string
            const liquidationInfoJson = JSON.stringify(liquidationInfo, null, '\t');
    
            return liquidationInfoJson;
    
        } catch (error) {
            this.logger.error('Error while getLiquidationInfo in lend-and-borrow.service.ts: ', error);
            throw error;
        }
    }

    async depositAsset(
        senderAddress: string, 
        amount: number, 
        assetAddress: string
    ): Promise<ethers.TransactionReceipt> {
        const senderWallet = await this.accountService.getAddressWallet(senderAddress);
        const amountInWei = ethers.parseEther(amount.toString());

        let contractName : string;
        const funcName : string = 'mint';
        let value : bigint = 0n; // Wemix amount sent with Tx
        let inputJson  = { senderAddress, amount, assetAddress}
        let input : string = JSON.stringify(inputJson)

        // this.logger.debug("assetAddress from Request : ",assetAddress);
        // this.logger.debug("AssetType.Wemix from Service : ",AssetType.Wemix);

        try {
            let txResult;
            switch (assetAddress) {
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
                    throw new Error('Invalid Asset Addres');
            }
            
            // .wait() : waits for the transaction to be mined and confirmed
            // due to the usage of .wait() which is a async work, await is required to resolve the Promise.
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
            this.logger.error('Error while depositAsset in lend-and-borrow.service.ts :', error);
            throw error;
        }
    }

    async borrowAsset(
        borrowerAddress: string, 
        borrowAmount: number, 
        assetAddress: string
    ): Promise<ethers.TransactionReceipt> {
        const senderWallet = await this.accountService.getAddressWallet(borrowerAddress);
        const amountInWei = ethers.parseEther(borrowAmount.toString());
    
        let contractName : string;
        const funcName : string = 'borrow';
        let value : bigint = 0n; // Wemix amount sent with Tx
        let inputJson  = { borrowerAddress, borrowAmount, assetAddress}
        let input : string = JSON.stringify(inputJson)
        
        try {
            let txResult;
            switch (assetAddress) {
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
                    throw new Error('Invalid Asset Addres');
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

    async liquidateAsset(
        liquidatorAddress:string, 
        borrowerAddress: string, 
        repayAmount: number, 
        liquidateAssetAddress : string,
        collateralAddress: string, 
    ): Promise<ethers.TransactionReceipt> {
        const liquidatorWallet = await this.accountService.getAddressWallet(liquidatorAddress);
        const repayAmountInWei = ethers.parseEther(repayAmount.toString());

        let contractName: string;
        const funcName = 'liquidateBorrow';
        let value : bigint = 0n; // Wemix amount sent with Tx
        let inputJson = JSON.stringify({ borrowerAddress, repayAmount, collateralAddress });

        let controllerViewjson;

        try {
            let txResult;
            
            switch (liquidateAssetAddress) {
                case AssetType.Wemix:
                    // WIP : checking seizeTokens manually with controllerView
                    // controllerViewjson = await this.wemixfiControllerViewContract.liquidateCalculateSeizeTokens(this.cWemixAddress,collateralAddress, repayAmountInWei)
                    // this.logger.debug("ControllerView returned seize amount 1.amountSeizeError 2. seizeTokens ", controllerViewjson)

                    // await this.cWemixContract.connect(liquidatorWallet).approve(this.cWemixAddress,repayAmountInWei);
                    txResult = await this.cWemixContract.connect(liquidatorWallet).liquidateBorrow(borrowerAddress, collateralAddress, { value: repayAmountInWei });
                    value = repayAmountInWei;
                    contractName = "CWemix";
                    break;
                case AssetType.WemixDollar:
                    await this.cWemixDollarContract.connect(liquidatorWallet).approve(this.cWemixDollarAddress,repayAmountInWei);
                    txResult = await this.cWemixDollarContract.connect(liquidatorWallet).liquidateBorrow(borrowerAddress,repayAmountInWei,collateralAddress);
                    contractName = "CWemixDollar";
                    break;
                case AssetType.StWemix:
                    await this.cstWemixContract.connect(liquidatorWallet).approve(this.cstWemixAddress,repayAmountInWei);
                    txResult = await this.cstWemixContract.connect(liquidatorWallet).liquidateBorrow(borrowerAddress,repayAmountInWei,collateralAddress);
                    contractName = "CstWemix";
                    break;
                default:
                    throw new Error('Invalid Asset Addres');
            }

            const txReceipt = await txResult.wait();
            const extractedData = await this.extractTxDataFromReceipt(txReceipt);

            // Log and store transaction information
            await this.databaseService.logTxInfo(
                extractedData.blockNumber,
                extractedData.blockTimestamp,
                extractedData.txHash,
                contractName,
                funcName,
                extractedData.funcSig,
                extractedData.from,
                extractedData.to,
                inputJson,
                value
            );

            return txReceipt;

        } catch (error) {
            this.logger.error('Error while liquidateAsset in lend-and-borrow.service.ts:', error);
            throw error;
        }
    }

    private async extractTxDataFromReceipt(txReceipt: ethers.TransactionReceipt): Promise<ReceiptData> {
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
