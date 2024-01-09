import { Injectable, Logger } from '@nestjs/common';
import {  ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';

import * as weswapRouterJson from '../../wemixFi_env/WeswapRouter.json'
import { WeswapRouter } from '../../types/ethers/WeswapRouter';

import * as wemixfi_addrs_dev from '../../wemixFi_env/wemixfi_addrs_dev.json'

@Injectable()
export class SwapService {

    private readonly cWemixAddress = wemixfi_addrs_dev.cWemix; // cEth.sol
    private readonly cWemixDollarAddress = wemixfi_addrs_dev.cWemixDollar; // cErc20.sol
    private readonly cstWemixAddress =  wemixfi_addrs_dev.cstWemix;
    private readonly wemixfiLendingViewAddress = wemixfi_addrs_dev.wemixfiLendingView;
    private readonly wemixfiControllerViewAddress = wemixfi_addrs_dev.controllerView;
    private readonly weswapRouterAddress = wemixfi_addrs_dev.router;

    private weswapRouterContract:WeswapRouter;

    private readonly weswapRouterContractABI = weswapRouterJson.abi;

    constructor(
        private databaseService: DatabaseService,
        private accountService: AccountService,
    ) {
        const provider = this.databaseService.provider();
        this.weswapRouterContract = new ethers.Contract(this.weswapRouterAddress, this.weswapRouterContractABI, provider) as unknown as WeswapRouter; // Contract converted to CWemix 
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
        try {
            const senderWallet = await this.accountService.getAddressWallet(msgSender);
            const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);

            const amountADesiredInWei = ethers.parseEther(amountADesired.toString());
            const amountBDesiredInWei = ethers.parseEther(amountBDesired.toString());
            const amountAMinInWei = ethers.parseEther(amountAMin.toString());
            const amountBMinInWei = ethers.parseEther(amountBMin.toString());

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
