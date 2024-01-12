import { Injectable, Logger } from '@nestjs/common';
import {  ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';

import * as stWemixJson from '../../wemixFi_env/StWEMIX.json'
import { StWEMIX } from '../../types/ethers/StWEMIX';

import * as wemixDollarJson from '../../wemixFi_env/WemixDollar.json'
import { WemixDollar } from '../../types/ethers/WemixDollar'

import * as ERC20Json from '../../wemixFi_env/ERC20.json'
import { ERC20 } from '../../types/ethers/ERC20'

import * as weswapRouterJson from '../../wemixFi_env/WeswapRouter.json'
import { WeswapRouter } from '../../types/ethers/WeswapRouter';

import * as IWeswapFactoryJson from '../../wemixFi_env/IWeswapFactory.json'
import { IWeswapFactory } from '../../types/ethers/IWeswapFactory';

import * as wemixfi_addrs_dev from '../../wemixFi_env/wemixfi_addrs_dev.json'

export enum SwapAssetType {
    wWemix = '0x244c72AB61f11dD44Bfa4AaF11e2EFD89ca789fe',
    stWemix = '0xc53B1C26C992CAF4662A1B98954E641f323d8a55',
    wemixD = '0xAe81b9fFCde5Ab7673dD4B2f5c648a5579430B17',
    ousdc = '0x3eFc2e351b64912168F15074a1e444E3272d64be',
    eth = '0xE19B799146276Fd8ba7Bf807347A33Ef7Fd49B4b',
    bnb = '0x9d88364cE61172D5398cD99c96b8D74899943fF4',
    usdt = '0x4e202313790ae15AE84A7E5716EbFbB358C43530'
}

// !!! Currently can't detect if a certain pair input is valid in 'WemixFi' thus throwing a Error which is not directly stating this situation
@Injectable()
export class SwapService {

    private readonly wWemixAddress = wemixfi_addrs_dev.wWemix;

    private readonly weswapRouterAddress = wemixfi_addrs_dev.router;
    private readonly weswapFactoryAddress = wemixfi_addrs_dev.factory; // factory : swapV2 factory

    private weswapRouterContract:WeswapRouter;
    private weswapFactoryContract : IWeswapFactory ;

    private readonly ERC20ContractABI = ERC20Json.abi;
    private readonly weswapRouterContractABI = weswapRouterJson.abi;
    private readonly weswapFactoryContractABI = IWeswapFactoryJson.abi;


    constructor(
        private databaseService: DatabaseService,
        private accountService: AccountService,
    ) {
        const provider = this.databaseService.provider();
        this.weswapRouterContract = new ethers.Contract(this.weswapRouterAddress, this.weswapRouterContractABI, provider) as unknown as WeswapRouter; 
        // weSwapFactory connect
        this.weswapFactoryContract = new ethers.Contract(this.weswapFactoryAddress, this.weswapFactoryContractABI,provider) as unknown as IWeswapFactory;

    }

    private readonly logger = new Logger(SwapService.name);

    async getQuote(amount:number,reserveAAmount:number,reserveBAmount:number,) : Promise<bigint> {
        try {
            const amountInWei = ethers.parseEther(amount.toString());
            const reserveAAmountInWei = ethers.parseEther(reserveAAmount.toString());
            const reserveBAmountInWei = ethers.parseEther(reserveBAmount.toString());
            const quoteResultInWei = await this.weswapRouterContract.quote(amountInWei,reserveAAmountInWei,reserveBAmountInWei);
            const quoteResult = quoteResultInWei/1000000000000000000n; // divided by 1e18
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
        msgSender: string,
        tokenA: string,
        tokenB: string,
        amountADesired: number,
        amountBDesired: number,
        amountAMin: number,
        amountBMin: number,
        to: string,
        deadline: number
    ): Promise<bigint[]> {
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
        
        const amountADesiredInWei = await this.convertToWei(tokenA,amountADesired);
        const amountBDesiredInWei = await this.convertToWei(tokenB,amountBDesired);
        const amountAMinInWei = await this.convertToWei(tokenA,amountAMin);
        const amountBMinInWei = await this.convertToWei(tokenB,amountBMin);

        try {

            // Approve tokens
            await this.approveToken(tokenA, senderWallet, amountADesiredInWei, this.weswapRouterAddress);
            await this.approveToken(tokenB, senderWallet, amountBDesiredInWei, this.weswapRouterAddress);
            
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
            
            const txReceipt = await tx.wait();
            const addLiquidityEvent  = txReceipt.logs?.find((e: any) => e.eventName === 'AddLiquidityReturn') as ethers.EventLog;

            // Checking the event existence and the validity
            if (!addLiquidityEvent || !('args' in addLiquidityEvent)) {
                throw new Error('AddLiquidityReturn event not found or not properly formatted');
            }

            const [amountToken, amountWEMIX, liquidity] = addLiquidityEvent.args;
            return [amountToken, amountWEMIX, liquidity];
        } catch (error) {
            this.logger.error('Error while adding liquidity in swap.service.ts: ', error);
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

        const amountTokenDesiredInWei = await this.convertToWei(tokenAddress,amountTokenDesired)
        const amountWEMIXDesiredInWei = await this.convertToWei(this.wWemixAddress,amountWEMIXDesired)
        const amountTokenMinInWei = await this.convertToWei(tokenAddress,amountTokenMin)
        const amountWEMIXMinInWei = await this.convertToWei(this.wWemixAddress,amountWEMIXMin)

        try {

            await this.approveToken(tokenAddress, senderWallet, amountTokenDesiredInWei, this.weswapRouterAddress);
            
            const tx = await weswapRouterContractWithSigner.addLiquidityWEMIX(
                tokenAddress,
                amountTokenDesiredInWei,
                amountTokenMinInWei,
                amountWEMIXMinInWei,
                to,
                deadline,
                { value: amountWEMIXDesiredInWei }
            );
            
            const txReceipt = await tx.wait();
            const addLiquidityEvent  = txReceipt.logs?.find((e: any) => e.eventName === 'AddLiquidityReturn') as ethers.EventLog;

            // Checking the event existence and the validity
            if (!addLiquidityEvent || !('args' in addLiquidityEvent)) {
                throw new Error('AddLiquidityReturn event not found or not properly formatted');
            }

            const [amountToken, amountWEMIX, liquidity] = addLiquidityEvent.args;
            return [amountToken, amountWEMIX, liquidity];
        } catch (error) {
            this.logger.error('Error while adding liquidity in swap.service.ts: ', error);
            throw error;
        }
    }

    async removeLiquidity(
        msgSender :string,
        tokenA: string,
        tokenB: string,
        liquidity: number,
        amountAMin: number,
        amountBMin: number,
        to: string,
        deadline: number
    ): Promise<{ amountA: bigint, amountB: bigint }> {
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = await this.weswapRouterContract.connect(senderWallet);
        const lpPairContractAddress = await this.weswapFactoryContract.connect(senderWallet).getPair(tokenA,tokenB )

        // this.logger.debug("LP Pair Contract using getPair : ",lpPairContractAddress )

        const liquidityInWei = ethers.parseEther(liquidity.toString());
        const amountAMinInWei = await this.convertToWei(tokenA,amountAMin)
        const amountBMinInWei = await this.convertToWei(tokenB,amountBMin)

        try {

            await this.approveToken(lpPairContractAddress, senderWallet, liquidityInWei, this.weswapRouterAddress);

            const tx = await weswapRouterContractWithSigner.removeLiquidity(
                tokenA,
                tokenB,
                liquidityInWei,
                amountAMinInWei,
                amountBMinInWei,
                to,
                deadline
            );

            const txReceipt = await tx.wait();
            const removeLiquidityEvent = txReceipt.logs?.find((e: any) => e.eventName === 'RemoveLiquidityReturn') as ethers.EventLog;

            if (!removeLiquidityEvent || !('args' in removeLiquidityEvent)) {
                throw new Error('RemoveLiquidityReturn event not found or not properly formatted');
            }

            const [amountA, amountB] = removeLiquidityEvent.args;
            return { amountA, amountB };
        } catch (error) {
            this.logger.error('Error while removing liquidity: ', error);
            throw error;
        }
    }

    async removeLiquidityWEMIX(
        msgSender :string,
        token: string,
        liquidity: number,
        amountTokenMin: number,
        amountWEMIXMin: number,
        to: string,
        deadline: number
    ): Promise<{ amountToken: bigint, amountWEMIX: bigint }> {
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
        // LP Pair Contract Address, wWemixAddress is fixed due to 
        const lpPairContractAddress = await this.weswapFactoryContract.connect(senderWallet).getPair(this.wWemixAddress,token )

        this.logger.debug("LP Pair Contract using getPair : ",lpPairContractAddress )

        const liquidityInWei = ethers.parseEther(liquidity.toString());

        const amountTokenMinInWei = await this.convertToWei(token,amountTokenMin)
        const amountWEMIXMinInWei = await this.convertToWei(this.wWemixAddress,amountWEMIXMin)

        try {
            // let lpBalance = await this.lp_stWemix_wWemix_Contract.balanceOf(msgSender);
            // this.logger.debug("lp balance of sender : ",lpBalance);
            // LP Token의 approve가 선행되어야 함
            // approve는 누적된다.
            await this.approveToken(lpPairContractAddress, senderWallet, liquidityInWei, this.weswapRouterAddress);

            this.logger.debug("Approval on LP stWemix/wWemix successful");

            const tx = await weswapRouterContractWithSigner.removeLiquidityWEMIX(
                token,
                liquidityInWei, // Liquidity not in WEI testing due to OVERFLOW error
                amountTokenMinInWei,
                amountWEMIXMinInWei,
                to,
                deadline
            );

            const txReceipt = await tx.wait();
            const removeLiquidityEvent = txReceipt.logs?.find((e: any) => e.eventName === 'RemoveLiquidityReturn') as ethers.EventLog;

            if (!removeLiquidityEvent || !('args' in removeLiquidityEvent)) {
                throw new Error('RemoveLiquidityReturn event not found or not properly formatted');
            }

            // lpBalance =  await this.lp_stWemix_wWemix_Contract.balanceOf(msgSender);
            // this.logger.debug("lp balance of sender : ",lpBalance);

            const [amountToken, amountWEMIX] = removeLiquidityEvent.args;
            return { amountToken, amountWEMIX };
        } catch (error) {
            this.logger.error('Error while removing liquidity WEMIX: ', error);
            throw error;
        }
    }

    // Swap Exact Token <-> Token
    async swapExactTokensForTokens(
        msgSender: string,
        amountIn: number,
        amountOutMin: number,
        path: string[],
        to: string,
        deadline: number
    ): Promise<boolean> {
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
    
        const amountInWei = await this.convertToWei(path[0], amountIn);
        const amountOutMinWei = await this.convertToWei(path[path.length - 1], amountOutMin);
    
        await this.approvePathTokens(path, senderWallet, amountInWei, this.weswapRouterAddress);
    
        try {
            const tx = await weswapRouterContractWithSigner.swapExactTokensForTokens(
                amountInWei,
                amountOutMinWei,
                path,
                to,
                deadline
            );

            const txReceipt = await tx.wait();
            this.logger.debug('txReceipt on Swap : ' + txReceipt.logs);
            console.log( txReceipt.logs)
            const swapEvent  = txReceipt.logs?.find((e: any) => e.eventName === 'Swap') as ethers.EventLog;
            if(swapEvent) {
                this.logger.debug('Swap Event Emitted : ' + swapEvent);
            } else {
                this.logger.debug('Swap Event not found')
            }

            return true;
        } catch (error) {
            this.logger.error('Error while swapping tokens: ', error);
            throw new Error('Error while swapping tokens: ' + error.message);
        }
    }
    
    async swapTokensForExactTokens(
        msgSender: string,
        amountOut: number,
        amountInMax: number,
        path: string[],
        to: string,
        deadline: number
    ): Promise<boolean> {
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
    
        const amountInMaxWei = await this.convertToWei(path[0], amountInMax);
        const amountOutWei = await this.convertToWei(path[path.length - 1], amountOut);
    
        await this.approvePathTokens(path, senderWallet, amountInMaxWei, this.weswapRouterAddress);
    
        try {
            const tx = await weswapRouterContractWithSigner.swapTokensForExactTokens(
                amountOutWei,
                amountInMaxWei,
                path,
                to,
                deadline
            );
    
            await tx.wait();
            return true;
        } catch (error) {
            this.logger.error('Error while swapping tokens for exact tokens: ', error);
            throw error;
        }
    }

    // Swap Exact WEMIX <-> Token
    async swapExactWEMIXForTokens(
        msgSender: string,
        amountIn: number,
        amountOutMin: number,
        path: string[],
        to: string,
        deadline: number,
    ): Promise<boolean> {
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
    
        const amountInWei = ethers.parseEther(amountIn.toString());
        const amountOutMinWei = await this.convertToWei(path[path.length - 1], amountOutMin);
    
        await this.approvePathTokens(path, senderWallet, amountInWei, this.weswapRouterAddress);

        try {
            const tx = await weswapRouterContractWithSigner.swapExactWEMIXForTokens(
                amountOutMinWei,
                path,
                to,
                deadline,
                { value: amountInWei }
            );
    
            await tx.wait();
            return true;
        } catch (error) {
            this.logger.error('Error while swapping WEMIX for tokens: ', error);
            throw error;
        }
    }    

    async swapTokensForExactWEMIX(
        msgSender: string,
        amountOut: number,
        amountInMax: number,
        path: string[],
        to: string,
        deadline: number
    ): Promise<boolean> {
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
    
        const amountInMaxWei = await this.convertToWei(path[0], amountInMax);
        const amountOutWei = ethers.parseEther(amountOut.toString()); // WEMIX is the output and has 18 decimals
    
        await this.approvePathTokens(path, senderWallet, amountInMaxWei, this.weswapRouterAddress);
    
        try {
            const tx = await weswapRouterContractWithSigner.swapTokensForExactWEMIX(
                amountOutWei,
                amountInMaxWei,
                path,
                to,
                deadline
            );
    
            await tx.wait();
            return true;
        } catch (error) {
            this.logger.error('Error while swapping tokens for WEMIX: ', error);
            throw error;
        }
    }
    

    // Swap Exact Token <-> WEMIX

    // WIP 

    // --- Internal Functions ---
    // old approveTokenLP => now approveToken, used universal not only in LP
    async approveToken(tokenAddress, senderWallet, amountInWei, routerAddress ){
        try {
            const tokenToApprove : ERC20 = new ethers.Contract(tokenAddress, this.ERC20ContractABI,this.databaseService.provider()) as unknown as ERC20;
            const tx = await tokenToApprove.connect(senderWallet).approve(routerAddress, amountInWei);
            return await tx.wait();
        } catch {
            throw new Error(`Error : approving ${amountInWei} for ${tokenAddress}`);
        }
    }

    async approvePathTokens(path: string[], senderWallet: ethers.Wallet, amountInWei: bigint, routerAddress: string): Promise<void> {
        for (let i = 0; i < path.length - 1; i++) {
            try {
                const tokenAmountToApprove = i === 0 ? amountInWei : ethers.MaxUint256;
                await this.approveToken(path[i], senderWallet, tokenAmountToApprove, routerAddress);
            } catch (error) {
                this.logger.error(`Error while approving token ${path[i]}: `, error);
                throw new Error(`Error while approving token ${path[i]}: ${error.message}`);
            }
        }
    }
    
    async getDecimal(tokenAddress):Promise<bigint> {
        try {
            const tokenContract : ERC20 = new ethers.Contract(tokenAddress, this.ERC20ContractABI,this.databaseService.provider()) as unknown as ERC20;
            const tokenDecimals =  await tokenContract.decimals();
            this.logger.debug(`Token Decimals : ${tokenDecimals}`);
            return tokenDecimals;
        } catch {
            throw new Error(`Error : getting decimals of ${tokenAddress} `);
        }
    }

    async convertToWei(tokenAddress,tokenAmount):Promise<bigint>{
        try {
            const tokenDecimal = await this.getDecimal(tokenAddress);
            const amountInWei = ethers.parseUnits(tokenAmount.toString(),tokenDecimal)
            return amountInWei;
        } catch {
            throw new Error(`Error : converting amount of ${tokenAddress} `);
        }
    }


}
