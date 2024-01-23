import { Injectable, Logger } from '@nestjs/common';
import { BigNumberish,AddressLike, ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';
import { ExtendedEthersService } from 'src/extended-ethers/extended-ethers.service';

import * as ERC20Json from '../../wemixFi_env/ERC20.json';
import { ERC20 } from '../../types/ethers/ERC20';

import * as swapRouterV3Json from '../../wemixFi_env/SwapRouterV3.json';
import { SwapRouterV3 } from '../../types/ethers/SwapRouterV3';

import * as nonfungiblePositionHelperJson from '../../wemixFi_env/NonfungiblePositionHelper.json';
import { NonfungiblePositionHelper } from '../../types/ethers/NonfungiblePositionHelper';

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
  private readonly NonfungiblePositionHelperContractABI =
    nonfungiblePositionHelperJson.abi;

  constructor(
    private databaseService: DatabaseService,
    private accountService: AccountService,
    private extendedEthersService: ExtendedEthersService,
  ) {
    const provider = this.databaseService.provider();
    this.swapRouterV3Contract = new ethers.Contract(
      this.swapRouterV3Address,
      this.swapRouterV3ContractABI,
      provider,
    ) as unknown as SwapRouterV3;

    this.NonfungiblePositionHelperContract = new ethers.Contract(
        this.NftPositionHelperAddress,
        this.NonfungiblePositionHelperContractABI,
        provider,
      ) as unknown as NonfungiblePositionHelper;
  }

  private readonly logger = new Logger(PoolV3Service.name);

  async easyMint(
    msgSender: AddressLike,
    token0: AddressLike,
    token1: AddressLike,
    fee: BigNumberish,
    tickLower: BigNumberish,
    tickUpper: BigNumberish,
    amount0Desired: BigNumberish,
    amount1Desired: BigNumberish,
    amount0Min: BigNumberish,
    amount1Min: BigNumberish,
    deadline: BigNumberish,
  ): Promise<bigint[]> {

    // Processing data for DB Logging
    const funcName = 'easyMint';
    let value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
    msgSender,
    token0,
    token1,
    fee,
    tickLower,
    tickUpper,
    amount0Desired,
    amount1Desired,
    amount0Min,
    amount1Min,
    deadline,
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const NFPHelperWithSigner =
      this.NonfungiblePositionHelperContract.connect(senderWallet);

    amount0Desired = await this.extendedEthersService.convertToWei(
      token0,
      amount0Desired,
    ) as BigNumberish;
    amount1Desired = await this.extendedEthersService.convertToWei(
      token1,
      amount1Desired,
    ) as BigNumberish;
    amount0Min = await this.extendedEthersService.convertToWei(
      token0,
      amount0Min,
    ) as BigNumberish;
    amount1Min = await this.extendedEthersService.convertToWei(
      token1,
      amount1Min,
    ) as BigNumberish;

    try {
      // Explicit Approve of Token not required?
      // Approve tokens
        await this.extendedEthersService.approveToken(
            token0,
            senderWallet,
            amount0Desired,
            this.NftPositionHelperAddress,
        );
        await this.extendedEthersService.approveToken(
            token1,
            senderWallet,
            amount1Desired,
            this.NftPositionHelperAddress,
        );

        if(token0 == this.wWemixAddress) {
            value = amount0Desired as bigint;
            console.log(`token0 address : ${token0} / value : ${value}`)
        } else if (token1 == this.wWemixAddress) {
            value = amount1Desired as bigint;
            console.log(`token0 address : ${token1} / value : ${value}`)
        }

      const easyMintParams = {
        token0,
        token1,
        fee,
        tickLower,
        tickUpper,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        deadline,
      };

      const tx = await NFPHelperWithSigner.easyMint(easyMintParams,{value});

      const txReceipt = await tx.wait();
      
      const testObj = await this.getEasyMintEventData(txReceipt)

      const easyMintEvent = txReceipt.logs?.find(
        (e: any) => e.eventName === 'EasyMint',
      ) as ethers.EventLog;

      // Checking the event existence and the validity
      if (!easyMintEvent || !('args' in easyMintEvent)) {
        throw new Error(
          'EasyMint event not found or not properly formatted',
        );
      }
      const [, , tokenId, liquidity, amount0, amount1] = easyMintEvent.args;

      return [token0, token1, tokenId, liquidity, amount0, amount1];
    } catch (error) {
      this.logger.error(
        'Error while easyMint function in pool-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }

  async getEasyMintEventData(
    txReceipt
  ): Promise<any> {
    const decodedLogs =
      await this.extendedEthersService.decodeReceiptLogs(txReceipt);

    console.log(decodedLogs);
    if (decodedLogs.length < 0) {
        throw Error("EasyMintEvent not found while getting EasyMint")
    }
    const easyMintEvents = decodedLogs.filter((log) => log.name === 'EasyMint');
    for (const e of easyMintEvents) {
      console.log(e);
    }

    return easyMintEvents;
  }

}
