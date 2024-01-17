import { Injectable, Logger } from '@nestjs/common';
import {  ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';

import * as ERC20Json from '../../wemixFi_env/ERC20.json'
import { ERC20 } from '../../types/ethers/ERC20'

import * as weswapRouterJson from '../../wemixFi_env/WeswapRouter.json'
import { WeswapRouter } from '../../types/ethers/WeswapRouter';

import * as IWeswapFactoryJson from '../../wemixFi_env/IWeswapFactory.json'
import { IWeswapFactory } from '../../types/ethers/IWeswapFactory';

import * as wemixfi_addrs_dev from '../../wemixFi_env/wemixfi_addrs_dev.json'


interface ReceiptData {
    blockNumber: number;
    blockTimestamp: string;
    txHash: string;
    funcSig: string;
    from: string;
    to: string;
}
const contractName :string = 'WeswapRouter';

@Injectable()
export class PoolService {

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

    private readonly logger = new Logger(PoolService.name);

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
            const [amountTokenA, amountTokenB, liquidity] = addLiquidityEvent.args;


            // Processing data for DB Logging
            const funcName = 'addLiquidity';
            let value : bigint = 0n; // Wemix amount sent with Tx
            let inputJson = JSON.stringify({ msgSender, tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin, to, deadline });
            let input : string = JSON.stringify(inputJson)

            const logObject = await this.databaseService.createPoolLogObject(txReceipt,contractName,funcName,input,value,tokenA,amountTokenA,tokenB,amountTokenB, liquidity, 0n);

            await this.databaseService.logPoolTx(
                logObject.block_number,
                logObject.block_timestamp,
                logObject.tx_hash,
                logObject.name,
                logObject.func_name,
                logObject.func_sig,
                logObject.from,
                logObject.to,
                logObject.input,
                logObject.value,
                logObject.assetAAddress,
                logObject.assetAAmount,
                logObject.assetBAddress,
                logObject.assetBAmount,
                logObject.liquidityAdded,
                logObject.liquidityRemoved,
            );

            return [amountTokenA, amountTokenB, liquidity];
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
            // console.log(txReceipt.logs);
            // Checking the event existence and the validity
            if (!addLiquidityEvent || !('args' in addLiquidityEvent)) {
                throw new Error('AddLiquidityReturn event not found or not properly formatted');
            }

            const [amountToken, amountWEMIX, liquidity] = addLiquidityEvent.args;

            const funcName = 'addLiquidityWEMIX';
            let value : bigint = amountWEMIXDesiredInWei; // Wemix amount sent with Tx
            let inputJson = JSON.stringify({ msgSender, tokenAddress, amountTokenDesired, amountWEMIXDesired, amountTokenMin, amountWEMIXMin, to, deadline });
            let input : string = JSON.stringify(inputJson)

            const logObject = await this.databaseService.createPoolLogObject(txReceipt,contractName,funcName,input,value,tokenAddress,amountToken, this.wWemixAddress, amountWEMIX, liquidity,0n);
            
            await this.databaseService.logPoolTx(
                logObject.block_number,
                logObject.block_timestamp,
                logObject.tx_hash,
                logObject.name,
                logObject.func_name,
                logObject.func_sig,
                logObject.from,
                logObject.to,
                logObject.input,
                logObject.value,
                logObject.assetAAddress,
                logObject.assetAAmount,
                logObject.assetBAddress,
                logObject.assetBAmount,
                logObject.liquidityAdded,
                logObject.liquidityRemoved,
            );

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

            const funcName = 'removeLiquidity';
            let value : bigint = 0n; // Wemix amount sent with Tx
            let inputJson = JSON.stringify({ msgSender, tokenA, tokenB,liquidity, amountAMin, amountBMin, to, deadline });
            let input : string = JSON.stringify(inputJson)

            const logObject = await this.databaseService.createPoolLogObject(txReceipt,contractName,funcName,input,value,tokenA,amountA,tokenB,amountB, 0n, liquidityInWei);
            
            await this.databaseService.logPoolTx(
                logObject.block_number,
                logObject.block_timestamp,
                logObject.tx_hash,
                logObject.name,
                logObject.func_name,
                logObject.func_sig,
                logObject.from,
                logObject.to,
                logObject.input,
                logObject.value,
                logObject.assetAAddress,
                logObject.assetAAmount,
                logObject.assetBAddress,
                logObject.assetBAmount,
                logObject.liquidityAdded,
                logObject.liquidityRemoved,
            );

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

            const [amountToken, amountWEMIX] = removeLiquidityEvent.args;

            const funcName = 'removeLiquidityWEMIX';
            let value : bigint = 0n; // Wemix amount sent with Tx
            let inputJson = JSON.stringify({ msgSender, token,liquidity, amountTokenMin, amountWEMIXMin, to, deadline});
            let input : string = JSON.stringify(inputJson)
            
            const logObject = await this.databaseService.createPoolLogObject(txReceipt,contractName,funcName,input,value,token, amountToken, this.wWemixAddress, amountWEMIX, 0n, liquidityInWei);
            
            await this.databaseService.logPoolTx(
                logObject.block_number,
                logObject.block_timestamp,
                logObject.tx_hash,
                logObject.name,
                logObject.func_name,
                logObject.func_sig,
                logObject.from,
                logObject.to,
                logObject.input,
                logObject.value,
                logObject.assetAAddress,
                logObject.assetAAmount,
                logObject.assetBAddress,
                logObject.assetBAmount,
                logObject.liquidityAdded,
                logObject.liquidityRemoved,
            );

            return { amountToken, amountWEMIX };
        } catch (error) {
            this.logger.error('Error while removing liquidity WEMIX: ', error);
            throw error;
        }
    }


    // --- Internal Functions ---
    async approveToken(tokenAddress, senderWallet, amountInWei, routerAddress ){
        try {
            const tokenToApprove : ERC20 = new ethers.Contract(tokenAddress, this.ERC20ContractABI,this.databaseService.provider()) as unknown as ERC20;
            const tx = await tokenToApprove.connect(senderWallet).approve(routerAddress, amountInWei);
            return await tx.wait();
        } catch {
            throw new Error(`Error : approving ${amountInWei} for ${tokenAddress}`);
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
            this.logger.debug(`Amount converted in wei ${amountInWei}`);
            return amountInWei;
        } catch {
            throw new Error(`Error : converting amount of ${tokenAddress} `);
        }
    }

}
