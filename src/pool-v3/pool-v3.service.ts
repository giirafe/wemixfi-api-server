import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';

import * as ERC20Json from '../../wemixFi_env/ERC20.json';
import { ERC20 } from '../../types/ethers/ERC20';

import * as swapRouterV3Json from '../../wemixFi_env/SwapRouterV3.json';
import { SwapRouterV3 } from '../../types/ethers/SwapRouterV3';

import * as nonfungiblePositionHelperJson from '../../wemixFi_env/NonfungiblePositionHelper.json';
import { NonfungiblePositionHelper } from '../../types/ethers/NonfungiblePositionHelper';

import * as IWeswapFactoryJson from '../../wemixFi_env/IWeswapFactory.json';
import { IWeswapFactory } from '../../types/ethers/IWeswapFactory';

import { contractInfos, CA } from 'wemixFi_env/contractInfo_testnet'; // CA for Contract Address


const contractName: string = 'NonfungiblePositionHelper';

@Injectable()
export class PoolV3Service {
    private readonly wWemixAddress = CA.wWemix;

    private readonly swapRouterV3Address = CA.swapRouterV3;
    private readonly NftPositionHelperAddress = CA.nftPositionHelper;
  
    private swapRouterV3Contract: SwapRouterV3;
    private NonfungiblePositionHelperContract: NonfungiblePositionHelper;
  
    private readonly ERC20ContractABI = ERC20Json.abi;
    private readonly swapRouterV3ContractABI = swapRouterV3Json.abi;
    private readonly NonfungiblePositionHelperContractABI = nonfungiblePositionHelperJson.abi;
  
    constructor(
      private databaseService: DatabaseService,
      private accountService: AccountService,
    ) {
      const provider = this.databaseService.provider();
      this.NonfungiblePositionHelperContract = new ethers.Contract(
        this.NftPositionHelperAddress,
        this.NonfungiblePositionHelperContractABI,
        provider,
      ) as unknown as NonfungiblePositionHelper;
    }

    private readonly logger = new Logger(PoolV3Service.name);

    // async addLiquidity(
    //     msgSender: string,
    //     tokenA: string,
    //     tokenB: string,
    //     amountADesired: number,
    //     amountBDesired: number,
    //     amountAMin: number,
    //     amountBMin: number,
    //     to: string,
    //     deadline: number,
    //   ): Promise<bigint[]> {
    //     const senderWallet = await this.accountService.getAddressWallet(msgSender);
    //     const weswapRouterContractWithSigner =
    //       this.NonfungiblePositionHelperContract.connect(senderWallet);
    
    //     const amountADesiredInWei = await this.convertToWei(tokenA, amountADesired);
    //     const amountBDesiredInWei = await this.convertToWei(tokenB, amountBDesired);
    //     const amountAMinInWei = await this.convertToWei(tokenA, amountAMin);
    //     const amountBMinInWei = await this.convertToWei(tokenB, amountBMin);
    
    //     try {
    //       // Approve tokens
    //       await this.approveToken(
    //         tokenA,
    //         senderWallet,
    //         amountADesiredInWei,
    //         this.weswapRouterAddress,
    //       );
    //       await this.approveToken(
    //         tokenB,
    //         senderWallet,
    //         amountBDesiredInWei,
    //         this.weswapRouterAddress,
    //       );
    
    //       const tx = await weswapRouterContractWithSigner.addLiquidity(
    //         tokenA,
    //         tokenB,
    //         amountADesiredInWei,
    //         amountBDesiredInWei,
    //         amountAMinInWei,
    //         amountBMinInWei,
    //         to,
    //         deadline,
    //       );
    
    //       const txReceipt = await tx.wait();
    //       const addLiquidityEvent = txReceipt.logs?.find(
    //         (e: any) => e.eventName === 'AddLiquidityReturn',
    //       ) as ethers.EventLog;
    
    //       // Checking the event existence and the validity
    //       if (!addLiquidityEvent || !('args' in addLiquidityEvent)) {
    //         throw new Error(
    //           'AddLiquidityReturn event not found or not properly formatted',
    //         );
    //       }
    //       const [amountTokenA, amountTokenB, liquidity] = addLiquidityEvent.args;
    
    //       // Processing data for DB Logging
    //       const funcName = 'addLiquidity';
    //       const value: bigint = 0n; // Wemix amount sent with Tx
    //       const inputJson = JSON.stringify({
    //         msgSender,
    //         tokenA,
    //         tokenB,
    //         amountADesired,
    //         amountBDesired,
    //         amountAMin,
    //         amountBMin,
    //         to,
    //         deadline,
    //       });
    //       const input: string = JSON.stringify(inputJson);
    
    //       const logObject = await this.databaseService.createPoolLogObject(
    //         txReceipt,
    //         contractName,
    //         funcName,
    //         input,
    //         value,
    //         tokenA,
    //         amountTokenA,
    //         tokenB,
    //         amountTokenB,
    //         liquidity,
    //         0n,
    //       );
    
    //       await this.databaseService.logPoolTx(
    //         logObject.block_number,
    //         logObject.block_timestamp,
    //         logObject.tx_hash,
    //         logObject.name,
    //         logObject.func_name,
    //         logObject.func_sig,
    //         logObject.from,
    //         logObject.to,
    //         logObject.input,
    //         logObject.value,
    //         logObject.assetAAddress,
    //         logObject.assetAAmount,
    //         logObject.assetBAddress,
    //         logObject.assetBAmount,
    //         logObject.liquidityAdded,
    //         logObject.liquidityRemoved,
    //       );
    
    //       return [amountTokenA, amountTokenB, liquidity];
    //     } catch (error) {
    //       this.logger.error(
    //         'Error while adding liquidity in swap.service.ts: ',
    //         error,
    //       );
    //       throw error;
    //     }
    //   }
    

}
