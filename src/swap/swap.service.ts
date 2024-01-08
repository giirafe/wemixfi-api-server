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
            // Additional conversion of bigInt to string required for JSON format
            return quoteResult;
        } catch(error) {
            this.logger.error('Error while getQuote in swap.service.ts : ', error);
            throw error;
        }
    }

    async getAmountOut(amount:number,reserveAaddress:string,reserveBaddress:string,) : Promise<bigint> {
        try {
            const amountInWei = ethers.parseEther(amount.toString());
            const amountOutInWei = await this.weswapRouterContract.getAmountOut(amountInWei,reserveAaddress,reserveBaddress);
            this.logger.debug('getAmountIn... ')
            // Additional conversion of bigInt to string required for JSON format
            return amountOutInWei;
        } catch(error) {
            this.logger.error('Error while getAmountOut in swap.service.ts : ', error);
            throw error;
        }
    }

    async getAmountIn(amount:number,reserveAaddress:string,reserveBaddress:string,) : Promise<bigint> {
        try {
            const amountInWei = ethers.parseEther(amount.toString());
            const amountInInWei = await this.weswapRouterContract.getAmountIn(amountInWei,reserveAaddress,reserveBaddress);
            this.logger.debug('getAmountIn... ')
            // Additional conversion of bigInt to string required for JSON format
            return amountInInWei;
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
            // Additional conversion of bigInt to string required for JSON format
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
            // Additional conversion of bigInt to string required for JSON format
            return amountsArray;
        } catch(error) {
            this.logger.error('Error while getAmountsIn in swap.service.ts : ', error);
            throw error;
        }
    }

    // async addLiquidity(
    //     tokenA : string,
    //     tokenB : string,
    //     amountADesired : number,
    //     amountBDesired : number,
    //     amountAMin : number,
    //     amountBMin : number,
    //     to : string,
    //     deadline  : number
    // ) : Promise<bigint[]> {

    // }

}
