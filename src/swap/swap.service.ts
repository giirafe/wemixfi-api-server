import { Injectable, Logger } from '@nestjs/common';
import {  ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';

// Should find wwemix abi and create type for it
// import * as stWemixJson from '../../wemixFi_env/StWEMIX.json'
// import { StWEMIX } from '../../types/ethers/StWEMIX';

import * as stWemixJson from '../../wemixFi_env/StWEMIX.json'
import { StWEMIX } from '../../types/ethers/StWEMIX';

import * as wemixDollarJson from '../../wemixFi_env/WemixDollar.json'
import { WemixDollar } from '../../types/ethers/WemixDollar'

import * as weswapRouterJson from '../../wemixFi_env/WeswapRouter.json'
import { WeswapRouter } from '../../types/ethers/WeswapRouter';

import * as wemixfi_addrs_dev from '../../wemixFi_env/wemixfi_addrs_dev.json'

export enum SwapAssetType {
    wWemix = '0x244c72AB61f11dD44Bfa4AaF11e2EFD89ca789fe',
    stWemix = '0xc53B1C26C992CAF4662A1B98954E641f323d8a55',
    wemixD = '0xAe81b9fFCde5Ab7673dD4B2f5c648a5579430B17',
    eth = '0xE19B799146276Fd8ba7Bf807347A33Ef7Fd49B4b',
    bnb = '0x9d88364cE61172D5398cD99c96b8D74899943fF4',
    usdt = '0x4e202313790ae15AE84A7E5716EbFbB358C43530'
}
@Injectable()
export class SwapService {

    private readonly wWemixAddress = wemixfi_addrs_dev.wWemix;
    private readonly stWemixAddress =  wemixfi_addrs_dev.stWemix;
    private readonly wemixDAddress = wemixfi_addrs_dev.wemixD;

    private readonly weswapRouterAddress = wemixfi_addrs_dev.router;

    private weswapRouterContract:WeswapRouter;
    // private wWemixContract;
    private stWemixContract:StWEMIX;
    private wemixDollarContract : WemixDollar;

    private readonly weswapRouterContractABI = weswapRouterJson.abi;
    // private readonly wWemixContractABI = wWemixJson.abi;
    private readonly stWemixContractABI = stWemixJson.abi;
    private readonly wemixDollarContractABI = wemixDollarJson.abi;

    constructor(
        private databaseService: DatabaseService,
        private accountService: AccountService,
    ) {
        const provider = this.databaseService.provider();
        this.weswapRouterContract = new ethers.Contract(this.weswapRouterAddress, this.weswapRouterContractABI, provider) as unknown as WeswapRouter; 
        // WIP : Implement after wWemix Json found
        // this.stWemixContract = new ethers.Contract(this.stWemixAddress, this.stWemixContractABI, provider) as unknown as StWEMIX; 
        this.stWemixContract = new ethers.Contract(this.stWemixAddress, this.stWemixContractABI, provider) as unknown as StWEMIX; 
        this.wemixDollarContract = new ethers.Contract(this.wemixDAddress, this.wemixDollarContractABI, provider) as unknown as WemixDollar; 
    }

    private readonly logger = new Logger(SwapService.name);

    async getQuote(amount:number,reserveAaddress:string,reserveBaddress:string,) : Promise<bigint> {
        try {
            const amountInWei = ethers.parseEther(amount.toString());
            const quoteResult = await this.weswapRouterContract.quote(amountInWei,reserveAaddress,reserveBaddress);
            this.logger.debug('getQuote returning amount to Asset B ')
            return quoteResult;
        } catch(error) {
            this.logger.error('Error while getQuote in swap.service.ts : ', error);
            throw error;
        }
    }

    async getAmountOut(amount:number,reserveIn:number,reserveOut:number,) : Promise<bigint> {
        try {
            const amountOut = await this.weswapRouterContract.getAmountOut(amount,reserveIn,reserveOut);
            this.logger.debug('getAmountOut from weswapRouter ')
            return amountOut;
        } catch(error) {
            this.logger.error('Error while getAmountOut in swap.service.ts : ', error);
            throw error;
        }
    }

    async getAmountIn(amount:number,reserveIn:number,reserveOut:number,) : Promise<bigint> {
        try {
            const amountOut = await this.weswapRouterContract.getAmountIn(amount,reserveIn,reserveOut);
            this.logger.debug('getAmountIn from weswapRouter ')
            return amountOut;
        } catch(error) {
            this.logger.error('Error while getAmountIn in swap.service.ts : ', error);
            throw error;
        }
    }

    async getAmountsOut(amount:number, path:string[]) : Promise<bigint[]> {
        try {
            const amountInWei = ethers.parseEther(amount.toString());
            this.logger.debug('path in getAmountsOut ', path);
            const amountsArray = await this.weswapRouterContract.getAmountsOut(amountInWei, path);
            // this.logger.debug('type of array element : ' + typeof amountsArray[0])
            return amountsArray;
        } catch(error) {
            this.logger.error('Error while getAmountsOut in swap.service.ts : ', error);
            throw error;
        }
    }

    async getAmountsIn(amount:number, path:string[]) : Promise<bigint[]> {
        try {
            const amountInWei = ethers.parseEther(amount.toString());
            const amountsArray = await this.weswapRouterContract.getAmountsIn(amountInWei,path);
            this.logger.debug('getAmountIn...Out ');
            return amountsArray;
        } catch(error) {
            this.logger.error('Error while getAmountsIn in swap.service.ts : ', error);
            throw error;
        }
    }

    async addLiquidityWEMIX(
        msgSender: string, // Private key of the user's wallet
        tokenAddress: string,
        amountTokenDesired: number,
        amountWEMIXDesired: number, // WEMIX는 native token인 것을 명심해야...
        amountTokenMin: number,
        amountWEMIXMin: number,
        to: string,
        deadline: number
    ): Promise<bigint[]> {
        // try catch 없이 addressWallet 가져 와도 되나
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
        let tokenApprovallResult;
        const amountTokenDesiredInWei = ethers.parseEther(amountTokenDesired.toString());
        const amountWEMIXDesiredInWei = ethers.parseEther(amountWEMIXDesired.toString());
        const amountTokenMinInWei = ethers.parseEther(amountTokenMin.toString());
        const amountWEMIXMinInWei = ethers.parseEther(amountWEMIXMin.toString());

        try {
            switch (tokenAddress) {
                // case SwapAssetType.wWemix:
                // tokenApprovallResult = await this.stWemixContract.connect(senderWallet).approve(this.weswapRouterAddress,amountTokenDesiredInWei);
                // break;
                case SwapAssetType.stWemix:
                    tokenApprovallResult = await this.stWemixContract.connect(senderWallet).approve(this.weswapRouterAddress,amountTokenDesiredInWei);
                    break;
                case SwapAssetType.wemixD:
                    tokenApprovallResult = await this.wemixDollarContract.connect(senderWallet).approve(this.weswapRouterAddress,amountTokenDesiredInWei);
                    break;
                default:
                    throw new Error('Invalid Swap Asset Address');
            }

            this.logger.debug('Activate addLiquidity ');
            
            const tx = await this.weswapRouterContract.connect(senderWallet).addLiquidityWEMIX(
                tokenAddress,
                amountTokenDesiredInWei,
                amountTokenMinInWei,
                amountWEMIXMinInWei,
                to,
                deadline,
                { value: amountWEMIXDesiredInWei }
            );
            
            this.logger.debug('Liquidity(WEMIX and Token) added: ', tx);
            const txResult = await tx.wait();
            const addLiquidityEvent  = txResult.logs?.find((e: any) => e.eventName === 'AddLiquidityReturn') as ethers.EventLog;

            if (!addLiquidityEvent) {
                throw new Error('AddLiquidityReturn event not found');
            }

            const [amountToken, amountWEMIX, liquidity ] = addLiquidityEvent.args;
            return [amountToken, amountWEMIX, liquidity];

            // Currently return test values
            // 1/10 Succeeded
            // return [0n,0n,0n];
        } catch (error) {
            this.logger.error('Error while adding liquidity in swap.service.ts: ', error);
            throw error;
        }
    }

    async addLiquidity(
        msgSender: string, // Private key of the user's wallet
        tokenA: string,
        tokenB: string,
        amountADesired: number,
        amountBDesired: number,
        amountAMin: number,
        amountBMin: number,
        to: string,
        deadline: number
    ): Promise<bigint[]> {
        // try catch 없이 addressWallet 가져 와도 되나
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
        let tokenAApprovallResult;
        let tokenBApprovallResult;
        const amountADesiredInWei = ethers.parseEther(amountADesired.toString());
        const amountBDesiredInWei = ethers.parseEther(amountBDesired.toString());
        const amountAMinInWei = ethers.parseEther(amountAMin.toString());
        const amountBMinInWei = ethers.parseEther(amountBMin.toString());

        try {
            switch (tokenA) {
                // case SwapAssetType.wWemix:
                //     txResult = await this.cWemixContract.connect(senderWallet).mint({ value: amountInWei });
                //     value = amountInWei; // value set manually on Wemix deposit
                //     contractName = "CWemix";
                //     break;
                case SwapAssetType.stWemix:
                    tokenAApprovallResult = await this.stWemixContract.connect(senderWallet).approve(this.weswapRouterAddress,amountADesiredInWei);
                    break;
                case SwapAssetType.wemixD:
                    tokenAApprovallResult = await this.wemixDollarContract.connect(senderWallet).approve(this.weswapRouterAddress,amountADesiredInWei);
                    break;
                default:
                    throw new Error('Invalid Swap Asset Address A');
            }

            switch (tokenB) {
                // case SwapAssetType.wWemix:
                //     txResult = await this.cWemixContract.connect(senderWallet).mint({ value: amountInWei });
                //     value = amountInWei; // value set manually on Wemix deposit
                //     contractName = "CWemix";
                //     break;
                case SwapAssetType.stWemix:
                    tokenBApprovallResult = await this.stWemixContract.connect(senderWallet).approve(this.weswapRouterAddress,amountBDesiredInWei);
                    break;
                case SwapAssetType.wemixD:
                    tokenBApprovallResult = await this.wemixDollarContract.connect(senderWallet).approve(this.weswapRouterAddress,amountBDesiredInWei);
                    break;
                default:
                    throw new Error('Invalid Swap Asset Address B');
            }

            this.logger.debug('Activate addLiquidity ');
            
            const tx = await weswapRouterContractWithSigner.addLiquidity(
                tokenA,
                tokenB,
                amountADesiredInWei,
                amountBDesiredInWei,
                amountAMinInWei,
                amountBMinInWei,
                to,
                deadline
            );

            const txResult = await tx.wait();
            this.logger.debug('Liquidity added: ', txResult);

            // Extract the return values from the transaction receipt if necessary
            // Depending on the Ethereum client and the event structure, you might need to adjust how you access these values.
            // const { amountA, amountB, liquidity } = receipt.events?.find((e: any) => e.event === 'AddLiquidityReturn').args;
            // return [amountA, amountB, liquidity];

            // Currently return test values
            return [0n,0n,0n];
        } catch (error) {
            this.logger.error('Error while adding liquidity in swap.service.ts: ', error);
            throw error;
        }
    }

}
