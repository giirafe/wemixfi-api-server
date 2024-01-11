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
    private readonly stWemixAddress =  wemixfi_addrs_dev.stWemix;
    private readonly wemixDAddress = wemixfi_addrs_dev.wemixD;
    private readonly oUSDCAddress = wemixfi_addrs_dev.ousdc;
    private readonly lp_stWemix_wWemix_Address = wemixfi_addrs_dev.lp_stWemix_wWemix;

    private readonly weswapRouterAddress = wemixfi_addrs_dev.router;
    private readonly weswapFactoryAddress = wemixfi_addrs_dev.factory; // factory : swapV2 factory

    private weswapRouterContract:WeswapRouter;
    // private wWemixContract;
    private stWemixContract:StWEMIX;
    private wemixDollarContract : WemixDollar;
    private oUSDCContract: WemixDollar; // WemixDollar와 동일한 abi로 설정, 큰 문제 없을듯(approve)만 사용하니께
    private lp_stWemix_wWemix_Contract : WemixDollar; // 일단 LP Swap Pair도 이걸로 설정 (approve 위한)
    private weswapFactoryContract : IWeswapFactory ;

    private readonly weswapRouterContractABI = weswapRouterJson.abi;
    // private readonly wWemixContractABI = wWemixJson.abi;
    private readonly stWemixContractABI = stWemixJson.abi;
    private readonly wemixDollarContractABI = wemixDollarJson.abi;

    private readonly weswapFactoryContractABI = IWeswapFactoryJson.abi;

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
        // WemixDollar ABI Reused on oUSDC and LP Swap Pair Contract
        this.oUSDCContract = new ethers.Contract(this.oUSDCAddress, this.wemixDollarContractABI,provider) as unknown as WemixDollar;

        // LP Pair Contract
        this.lp_stWemix_wWemix_Contract = new ethers.Contract(this.lp_stWemix_wWemix_Address, this.wemixDollarContractABI,provider) as unknown as WemixDollar;

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

        this.logger.debug("LP Pair Contract using getPair : ",lpPairContractAddress )


        const liquidityInWei = ethers.parseEther(liquidity.toString());

        const amountAMinInWei = await this.convertToWei(tokenA,amountAMin)
        const amountBMinInWei = await this.convertToWei(tokenB,amountBMin)

        try {

            await this.approveTokenLP(lpPairContractAddress, senderWallet, liquidityInWei, this.weswapRouterAddress);

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
            let lpBalance = await this.lp_stWemix_wWemix_Contract.balanceOf(msgSender);
            this.logger.debug("lp balance of sender : ",lpBalance);
            // LP Token의 approve가 선행되어야 함
            // approve는 누적된다.
            await this.approveTokenLP(lpPairContractAddress, senderWallet, liquidityInWei, this.weswapRouterAddress);

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

            lpBalance =  await this.lp_stWemix_wWemix_Contract.balanceOf(msgSender);
            this.logger.debug("lp balance of sender : ",lpBalance);

            const [amountToken, amountWEMIX] = removeLiquidityEvent.args;
            return { amountToken, amountWEMIX };
        } catch (error) {
            this.logger.error('Error while removing liquidity WEMIX: ', error);
            throw error;
        }
    }


    async approveToken(tokenType, senderWallet, amountInWei, routerAddress) {
        let tx;
        switch (tokenType) {
            case SwapAssetType.stWemix:
                tx =  await this.stWemixContract.connect(senderWallet).approve(routerAddress, amountInWei);
                return await tx.wait();
            case SwapAssetType.wemixD:
                tx = await this.wemixDollarContract.connect(senderWallet).approve(routerAddress, amountInWei);
                return await tx.wait();
            case SwapAssetType.ousdc:
                tx = await this.oUSDCContract.connect(senderWallet).approve(routerAddress, amountInWei);
                return await tx.wait();
            case this.lp_stWemix_wWemix_Address:
                tx =  await this.lp_stWemix_wWemix_Contract.connect(senderWallet).approve(routerAddress, amountInWei);
                return await tx.wait();
            default:
                throw new Error(`Invalid Swap Asset Type: ${tokenType}`);
        }
    }

    async approveTokenLP(tokenAddress, senderWallet, amountInWei, routerAddress ){
        try {
            const lpPairContract : WemixDollar = new ethers.Contract(tokenAddress, this.wemixDollarContractABI,this.databaseService.provider()) as unknown as WemixDollar;
            const tx = await lpPairContract.connect(senderWallet).approve(routerAddress, amountInWei);
            return await tx.wait();
        } catch {
            throw new Error(`Error in approving ${amountInWei} for ${tokenAddress}`);
        }
    }
    
    async getDecimal(tokenAddress):Promise<bigint> {
        try {
            const tokenContract : WemixDollar = new ethers.Contract(tokenAddress, this.wemixDollarContractABI,this.databaseService.provider()) as unknown as WemixDollar;
            const tokenDecimals =  await tokenContract.decimals();
            this.logger.debug(`Token Decimals : ${tokenDecimals}`);
            return tokenDecimals;
        } catch {
            throw new Error(`Error getting decimals of ${tokenAddress} `);
        }
    }

    async convertToWei(tokenAddress,tokenAmount):Promise<bigint>{
        try {
            const tokenDecimal = await this.getDecimal(tokenAddress);
            const amountInWei = ethers.parseUnits(tokenAmount.toString(),tokenDecimal)
            return amountInWei;
        } catch {
            throw new Error(`Error converting amount of ${tokenAddress} `);
        }
    }
}
