import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';

import * as ERC20Json from '../../wemixFi_env/ERC20.json'
import { ERC20 } from '../../types/ethers/ERC20'

import * as weswapRouterJson from '../../wemixFi_env/WeswapRouter.json'
import { WeswapRouter } from '../../types/ethers/WeswapRouter';

import * as IWeswapFactoryJson from '../../wemixFi_env/IWeswapFactory.json'
import { IWeswapFactory } from '../../types/ethers/IWeswapFactory';

import { contractInfos, CA } from 'wemixFi_env/contractInfo_testnet';

const contractName: string = 'WeswapRouter';

// !!! Currently can't detect if a certain pair input is valid in 'WemixFi' thus throwing a Error which is not directly stating this situation
@Injectable()
export class SwapService {

    private readonly wWemixAddress = CA.wWemix;

    private readonly weswapRouterAddress = CA.router;
    private readonly weswapFactoryAddress = CA.factory; // factory : swapV2 factory

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
            console.log(error);
            throw error;
        }
    }

    async getAmountsIn(amount:number, path:string[]) : Promise<bigint[]> {
        try {
            const amountInWei = ethers.parseEther(amount.toString());
            const amountsArray = await this.weswapRouterContract.getAmountsIn(amountInWei,path);
            this.logger.debug('getAmountsIn...Out from SwapV2 Router ');
            return amountsArray;
        } catch(error) {
            this.logger.error('Error while getAmountsIn in swap.service.ts : ', error);
            console.log(error);
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
    ): Promise<{swapInAmount : bigint, swapOutAmount : bigint}> {

        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
    
        const swapInAmount = await this.convertToWei(path[0], amountIn);
        const amountOutMinWei = await this.convertToWei(path[path.length - 1], amountOutMin);
    
        await this.approveToken(path[0], senderWallet, swapInAmount, this.weswapRouterAddress);

        try {
            const tx = await weswapRouterContractWithSigner.swapExactTokensForTokens(
                swapInAmount,
                amountOutMinWei,
                path,
                to,
                deadline
            );

            const txReceipt = await tx.wait();

            const funcName = 'swapExactTokensForTokens';
            let value : bigint = 0n; // Wemix amount sent with Tx
            let inputJson = JSON.stringify({ msgSender, amountIn, amountOutMin, path, to, deadline });
            let input : string = JSON.stringify(inputJson)
            
            // Input Amount of certain asset => use amountIn from User Input, Output Amount of certain asset => extract from 'Swap' event.
            const swapOutAmount = await this.getSwapAmountOut(txReceipt,msgSender,this.weswapRouterAddress);

            console.log(swapOutAmount);

            if(swapOutAmount) {
                this.logger.debug(`Swap Event Emitted, swapAmountIn ${swapInAmount}, Out ${swapOutAmount} `);
            } else {
                this.logger.debug('Swap Event not found')
            }

            const logObject = await this.databaseService.createSwapV2LogObject(txReceipt,contractName,funcName,input,value,path[0],swapInAmount,path[path.length-1],swapOutAmount);

            await this.databaseService.logSwapV2Tx(
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
                logObject.swapInAddress,
                logObject.swapInAmount,
                logObject.swapOutAddress,
                logObject.swapOutAmount,
            );

            return {swapInAmount,swapOutAmount};
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

        const funcName = 'swapExactTokensForTokens';
        let value : bigint = 0n; // Wemix amount sent with Tx
        let inputJson = JSON.stringify({ msgSender, amountOut, amountInMax, path, to, deadline });
        let input : string = JSON.stringify(inputJson)
        
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
    
        const amountInMaxWei = await this.convertToWei(path[0], amountInMax);
        const amountOutWei = await this.convertToWei(path[path.length - 1], amountOut);
    
        // await this.approvePathTokens(path, senderWallet, amountInMaxWei, this.weswapRouterAddress);
        await this.approveToken(path[0], senderWallet, amountInMaxWei, this.weswapRouterAddress);
    
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

        const funcName = 'swapExactWEMIXForTokens';
        let value : bigint = 0n; // Wemix amount sent with Tx
        let inputJson = JSON.stringify({ msgSender, amountIn, amountOutMin, path, to, deadline });
        let input : string = JSON.stringify(inputJson)

        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
    
        const amountInWei = ethers.parseEther(amountIn.toString());
        const amountOutMinWei = await this.convertToWei(path[path.length - 1], amountOutMin);
    
        await this.approveToken(path[0], senderWallet, amountInWei, this.weswapRouterAddress);

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

        const funcName = 'swapTokensForExactWEMIX';
        let value : bigint = 0n; // Wemix amount sent with Tx
        let inputJson = JSON.stringify({ msgSender, amountOut, amountInMax, path, to, deadline });
        let input : string = JSON.stringify(inputJson)

        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
    
        const amountInMaxWei = await this.convertToWei(path[0], amountInMax);
        const amountOutWei = ethers.parseEther(amountOut.toString()); // WEMIX is the output and has 18 decimals
    
        // await this.approvePathTokens(path, senderWallet, amountInMaxWei, this.weswapRouterAddress);
        await this.approveToken(path[0], senderWallet, amountInMaxWei, this.weswapRouterAddress);

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
    async swapExactTokensForWEMIX(
        msgSender: string,
        amountIn: number,
        amountOutMin: number,
        path: string[],
        to: string,
        deadline: number,
    ): Promise<boolean> {

        const funcName = 'swapExactTokensForWEMIX';
        let value : bigint = 0n; // Wemix amount sent with Tx
        let inputJson = JSON.stringify({ msgSender, amountIn, amountOutMin, path, to, deadline });
        let input : string = JSON.stringify(inputJson)
        
        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
    
        const amountInWei = await this.convertToWei(path[path.length - 1], amountIn); 
        const amountOutMinWei = ethers.parseEther(amountOutMin.toString());
    
        await this.approveToken(path[0], senderWallet, amountInWei, this.weswapRouterAddress);

        try {
            const tx = await weswapRouterContractWithSigner.swapExactTokensForWEMIX(
                amountInWei,
                amountOutMinWei,
                path,
                to,
                deadline,
            );
    
            await tx.wait();
            return true;
        } catch (error) {
            this.logger.error('Error while swapping Exact Token -> WEMIX : ', error);
            throw error;
        }
    }    

    async swapWEMIXForExactTokens(
        msgSender: string,
        amountOut: number,
        amountInMax: number,
        path: string[],
        to: string,
        deadline: number
    ): Promise<boolean> {

        const funcName = 'swapTokensForExactWEMIX';
        let value : bigint = 0n; // Wemix amount sent with Tx
        let inputJson = JSON.stringify({ msgSender, amountOut, amountInMax, path, to, deadline });
        let input : string = JSON.stringify(inputJson)

        const senderWallet = await this.accountService.getAddressWallet(msgSender);
        const weswapRouterContractWithSigner = this.weswapRouterContract.connect(senderWallet);
    
        const amountInMaxWei = ethers.parseEther(amountInMax.toString()); // WWemix has 18 decimals by default
        const amountOutWei = await this.convertToWei(path[path.length -1], amountOut);

        await this.approveToken(path[0], senderWallet, amountInMaxWei, this.weswapRouterAddress);

        try {
            const tx = await weswapRouterContractWithSigner.swapWEMIXForExactTokens(
                amountOutWei,
                path,
                to,
                deadline,
                { value: amountInMaxWei }
            );
    
            await tx.wait();
            return true;
        } catch (error) {
            this.logger.error('Error while swapping WEMIX for Exact Token : ', error);
            throw error;
        }
    }

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

    async getSwapAmountOut(txReceipt, msgSender:string, routerAddress: string): Promise<bigint | undefined> {
        
        const decodedLogs = await this.decodeReceiptLogs(txReceipt);
        for (const log of decodedLogs) {
            console.log(log);
        }
        
        const swapEvents = decodedLogs.filter(log => log.name === "Swap");

        // Initialize the values to undefined
        let amount0Out: bigint | undefined;
        let amount1Out: bigint | undefined;

        if (swapEvents.length > 0) {
            // Extracting the amountOut values from the last 'Swap' Event.
            amount0Out = swapEvents[swapEvents.length - 1].args.amount1Out
            amount1Out = swapEvents[swapEvents.length - 1].args.amount1Out
            if(msgSender < routerAddress) {
                console.log("msgSender : amount0 ")
                return amount0Out
            } else {
                console.log("msgSender : amount1 ")
                return amount1Out
            }
        } else {
            throw Error("No 'Swap' event found in Tx Receipt")
        }
    }

    async decodeReceiptLogs(receiptLogs):Promise<any> {

        const decodedLogs = [];

        for (const log of receiptLogs) {
            if (contractInfos[log.address]) {
                const contractName: string = contractInfos[log.address].name;
                let abiName: string = contractInfos[log.address].abi;
    
                try {
                    console.log(`Address found: ${log.address}, Contract Name: ${contractName}, ABI Name: ${abiName}`);

                    // Dynamically import the ABI from wemixFi_env directory
                    const contractJSON = await import(`../../wemixFi_env/${abiName}.json`);
                    // const contractJSON = await import(`../../wemixFi_env/WWEMIX.json`);
                    // const contractJSON2 = await import(`../../wemixFi_env/WeswapPair.json`);
                    const iface = new ethers.Interface(contractJSON.abi);

                    // Decode the log with the interface
                    const decodedLog = iface.parseLog({
                        topics: log.topics,
                        data: log.data,
                    });
                    decodedLogs.push(decodedLog);

                    // console.log(`Decoded Log : ${JSON.stringify(decodedLog)}`);
                } catch (error) {
                    console.error(`Error loading ABI for ${log.address}, ${abiName}: ${error.message}`);
                }
            } else {
                console.log(`Address not found: ${log.address}`);
            }
        }
        return decodedLogs
    }
    
}
