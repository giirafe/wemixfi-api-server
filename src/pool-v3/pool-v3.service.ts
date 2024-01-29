import { Injectable, Logger } from '@nestjs/common';
import { BigNumberish, AddressLike, ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';
import { ExtendedEthersService } from 'src/extended-ethers/extended-ethers.service';

import * as ERC20Json from '../../wemixFi_env/ERC20.json';
import { ERC20 } from '../../types/ethers/ERC20';

import * as swapRouterV3Json from '../../wemixFi_env/SwapRouterV3.json';
import { SwapRouterV3 } from '../../types/ethers/SwapRouterV3';

import * as nonfungiblePositionHelperJson from '../../wemixFi_env/NonfungiblePositionHelper.json';
import { NonfungiblePositionHelper } from '../../types/ethers/NonfungiblePositionHelper';

import * as nonfungiblePositionManagerJson from '../../wemixFi_env/NonfungiblePositionManager.json';
import { NonfungiblePositionManager } from 'types/ethers';

import { contractInfos, CA } from 'wemixFi_env/contractInfo_testnet'; // CA for Contract Address

const contractName: string = 'NonfungiblePositionHelper';

@Injectable()
export class PoolV3Service {
  private readonly wWemixAddress = CA.wWemix;

  private readonly NftPositionHelperAddress = CA.nftPositionHelper;
  private readonly NftPositionManagerAddress = CA.nftPositionManager;

  private NonfungiblePositionHelperContract: NonfungiblePositionHelper;
  private NonfungiblePositionManagerContract: NonfungiblePositionManager;

  private readonly ERC20ContractABI = ERC20Json.abi;
  private readonly swapRouterV3ContractABI = swapRouterV3Json.abi;
  private readonly NonfungiblePositionHelperContractABI =
    nonfungiblePositionHelperJson.abi;
  private readonly NonfungiblePositionManagerContractABI =
    nonfungiblePositionManagerJson.abi;

  constructor(
    private databaseService: DatabaseService,
    private accountService: AccountService,
    private extendedEthersService: ExtendedEthersService,
  ) {
    const provider = this.databaseService.provider();

    this.NonfungiblePositionHelperContract = new ethers.Contract(
      this.NftPositionHelperAddress,
      this.NonfungiblePositionHelperContractABI,
      provider,
    ) as unknown as NonfungiblePositionHelper;

    this.NonfungiblePositionManagerContract = new ethers.Contract(
      this.NftPositionManagerAddress,
      this.NonfungiblePositionManagerContractABI,
      provider,
    ) as unknown as NonfungiblePositionManager;
  }

  private readonly logger = new Logger(PoolV3Service.name);

  // getPositionInfo interacts with NFP'Manager' exceptionally.
  async getPositionInfo(tokenId: BigNumberish) {
    const positionInfo =
      await this.NonfungiblePositionManagerContract.positions(tokenId);
    return positionInfo;
  }

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

    amount0Desired = (await this.extendedEthersService.convertToWei(
      token0,
      amount0Desired,
    )) as BigNumberish;
    amount1Desired = (await this.extendedEthersService.convertToWei(
      token1,
      amount1Desired,
    )) as BigNumberish;
    amount0Min = (await this.extendedEthersService.convertToWei(
      token0,
      amount0Min,
    )) as BigNumberish;
    amount1Min = (await this.extendedEthersService.convertToWei(
      token1,
      amount1Min,
    )) as BigNumberish;

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

      if (token0 == this.wWemixAddress) {
        value = amount0Desired as bigint;
        console.log(`token0 address : ${token0} / value : ${value}`);
      } else if (token1 == this.wWemixAddress) {
        value = amount1Desired as bigint;
        console.log(`token1 address : ${token1} / value : ${value}`);
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

      const tx = await NFPHelperWithSigner.easyMint(easyMintParams, { value });

      const txReceipt = await tx.wait();

      const easyMintEvent = await this.getEventFromReceipt(
        txReceipt,
        'EasyMint',
      );
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

  async increaseLiquidity(
    msgSender: AddressLike,
    tokenId: BigNumberish,
    amount0Desired: BigNumberish,
    amount1Desired: BigNumberish,
    amount0Min: BigNumberish,
    amount1Min: BigNumberish,
    deadline: BigNumberish,
  ): Promise<bigint[]> {
    // Processing data for DB Logging
    const funcName = 'increaseLiquidity';
    let value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
      msgSender,
      tokenId,
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

    const positionInfo = await this.getPositionInfo(tokenId);
    console.log('positionInfo from custom getter function : ' + positionInfo);
    const token0 = positionInfo.token0;
    const token1 = positionInfo.token1;

    amount0Desired = (await this.extendedEthersService.convertToWei(
      token0,
      amount0Desired,
    )) as BigNumberish;
    amount1Desired = (await this.extendedEthersService.convertToWei(
      token1,
      amount1Desired,
    )) as BigNumberish;
    amount0Min = (await this.extendedEthersService.convertToWei(
      token0,
      amount0Min,
    )) as BigNumberish;
    amount1Min = (await this.extendedEthersService.convertToWei(
      token1,
      amount1Min,
    )) as BigNumberish;

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

      if (token0 == this.wWemixAddress) {
        value = amount0Desired as bigint;
        console.log(`token0 address : ${token0} / value : ${value}`);
      } else if (token1 == this.wWemixAddress) {
        value = amount1Desired as bigint;
        console.log(`token1 address : ${token1} / value : ${value}`);
      }

      const increaseLiquidityParams = {
        tokenId,
        amount0Desired,
        amount1Desired,
        amount0Min,
        amount1Min,
        deadline,
      };

      const tx = await NFPHelperWithSigner.increaseLiquidity(
        increaseLiquidityParams,
        { value },
      );

      const txReceipt = await tx.wait();

      const increaseLiquidityEvent = await this.getEventFromReceipt(
        txReceipt,
        'IncreaseLiquidity',
      );
      const [, , , liquidity, amount0, amount1] = increaseLiquidityEvent.args;

      return [token0, token1, tokenId, liquidity, amount0, amount1];
    } catch (error) {
      this.logger.error(
        'Error while increaseLiquidity function in pool-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }

  async easyCollect(
    msgSender: AddressLike,
    tokenId: BigNumberish,
    amount0Max: BigNumberish,
    amount1Max: BigNumberish,
  ): Promise<bigint[]> {
    // Processing data for DB Logging
    const funcName = 'easyCollect';
    const value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
      msgSender,
      tokenId,
      amount0Max,
      amount1Max,
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    console.log('Sender Wallet : ' + JSON.stringify(senderWallet));

    const NFPHelperWithSigner =
      this.NonfungiblePositionHelperContract.connect(senderWallet);

    const positionInfo = await this.getPositionInfo(tokenId);
    console.log('positionInfo from custom getter function : ' + positionInfo);
    const token0 = positionInfo.token0;
    const token1 = positionInfo.token1;

    amount0Max = (await this.extendedEthersService.convertToWei(
      token0,
      amount0Max,
    )) as BigNumberish;
    amount1Max = (await this.extendedEthersService.convertToWei(
      token1,
      amount1Max,
    )) as BigNumberish;

    // Approval to Helper on User's Pool NFT is mandated
    try {
      await this.NonfungiblePositionManagerContract.connect(
        senderWallet,
      ).setApprovalForAll(this.NftPositionHelperAddress, true, {
        from: senderWallet.address,
        gasPrice: 110 * 10 ** 9,
      });
    } catch (err) {
      console.error(err);
    }

    try {
      const easyCollectParams = {
        tokenId,
        amount0Max,
        amount1Max,
      };

      const tx = await NFPHelperWithSigner.easyCollect(easyCollectParams, {
        value,
      });

      const txReceipt = await tx.wait();

      const easyCollectEvent = await this.getEventFromReceipt(
        txReceipt,
        'EasyCollect',
      );
      const [, , liquidity, amount0, amount1] = easyCollectEvent.args;

      return [token0, token1, tokenId, liquidity, amount0, amount1];
    } catch (error) {
      this.logger.error(
        'Error while easyCollect function in pool-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }

  // WIP : Need revision due 'missing revert data' Error
  async easyCompound(
    msgSender: AddressLike,
    tokenId: BigNumberish,
    amount0CollectMax: BigNumberish,
    amount1CollectMax: BigNumberish,
    amount0LiquidityMin: BigNumberish,
    amount1LiquidityMin: BigNumberish,
    deadline: BigNumberish,
  ): Promise<bigint[]> {
    // Processing data for DB Logging
    const funcName = 'easyCompound';
    const value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
      msgSender,
      tokenId,
      amount0CollectMax,
      amount1CollectMax,
      amount0LiquidityMin,
      amount1LiquidityMin,
      deadline,
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const NFPHelperWithSigner =
      this.NonfungiblePositionHelperContract.connect(senderWallet);

    const positionInfo = await this.getPositionInfo(tokenId);
    console.log('positionInfo from custom getter function : ' + positionInfo);
    const token0 = positionInfo.token0;
    const token1 = positionInfo.token1;

    // Converting the input in to Wei unit
    amount0CollectMax = (await this.extendedEthersService.convertToWei(
      token0,
      amount0CollectMax,
    )) as BigNumberish;
    amount1CollectMax = (await this.extendedEthersService.convertToWei(
      token1,
      amount1CollectMax,
    )) as BigNumberish;

    // Approval to Helper on User's Pool NFT is mandated
    try {
      await this.NonfungiblePositionManagerContract.connect(
        senderWallet,
      ).setApprovalForAll(this.NftPositionHelperAddress, true, {
        from: senderWallet.address,
        gasPrice: 110 * 10 ** 9,
      });
    } catch (err) {
      console.error(err);
    }

    console.log('Token Approval on NFT Position Helper Done');

    try {
      const easyCompoundParams = {
        tokenId,
        amount0CollectMax,
        amount1CollectMax,
        amount0LiquidityMin,
        amount1LiquidityMin,
        deadline,
      };

      const tx = await NFPHelperWithSigner.easyCompound(easyCompoundParams, {
        value,
      });

      const txReceipt = await tx.wait();

      const easyCompoundEvent = await this.getEventFromReceipt(
        txReceipt,
        'EasyCompound',
      );
      const [, , liquidity, amount0, amount1] = easyCompoundEvent.args;

      return [token0, token1, tokenId, liquidity, amount0, amount1];
    } catch (error) {
      this.logger.error(
        'Error while easyCompound function in pool-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }

  async easyDecreaseLiquidityCollect(
    msgSender: AddressLike,
    tokenId: BigNumberish,
    liquidity: BigNumberish,
    amount0LiquidityMin: BigNumberish,
    amount1LiquidityMin: BigNumberish,
    amount0CollectMax: BigNumberish,
    amount1CollectMax: BigNumberish,
    deadline: BigNumberish,
  ): Promise<bigint[]> {
    // Processing data for DB Logging
    const funcName = 'easyDecreaseLiquidityCollect';
    const value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
      msgSender,
      tokenId,
      liquidity,
      amount0LiquidityMin,
      amount1LiquidityMin,
      amount0CollectMax,
      amount1CollectMax,
      deadline,
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const NFPHelperWithSigner =
      this.NonfungiblePositionHelperContract.connect(senderWallet);

    const positionInfo = await this.getPositionInfo(tokenId);
    console.log('positionInfo from custom getter function : ' + positionInfo);
    const token0 = positionInfo.token0;
    const token1 = positionInfo.token1;

    amount0LiquidityMin = (await this.extendedEthersService.convertToWei(
      token0,
      amount0LiquidityMin,
    )) as BigNumberish;
    amount1LiquidityMin = (await this.extendedEthersService.convertToWei(
      token1,
      amount1LiquidityMin,
    )) as BigNumberish;
    amount0CollectMax = (await this.extendedEthersService.convertToWei(
      token0,
      amount0CollectMax,
    )) as BigNumberish;
    amount1CollectMax = (await this.extendedEthersService.convertToWei(
      token1,
      amount1CollectMax,
    )) as BigNumberish;

    // Approval to Helper on User's Pool NFT is mandated
    try {
      await this.NonfungiblePositionManagerContract.connect(
        senderWallet,
      ).setApprovalForAll(this.NftPositionHelperAddress, true, {
        from: senderWallet.address,
        gasPrice: 110 * 10 ** 9,
      });
    } catch (err) {
      console.error(err);
    }

    try {
      const easyDecreaseLiquidityCollectParams = {
        tokenId,
        liquidity,
        amount0LiquidityMin,
        amount1LiquidityMin,
        amount0CollectMax,
        amount1CollectMax,
        deadline,
      };

      const tx = await NFPHelperWithSigner.easyDecreaseLiquidityCollect(
        easyDecreaseLiquidityCollectParams,
        { value },
      );

      const txReceipt = await tx.wait();

      const easyDecreaseLiquidityCollectEvent = await this.getEventFromReceipt(
        txReceipt,
        'EasyDecreaseLiquidityCollectAll',
      );
      const [, , , , amount0, amount1] = easyDecreaseLiquidityCollectEvent.args;

      console.log(
        'Args in easyDecreaseLiquidity event : ' +
          easyDecreaseLiquidityCollectEvent.args,
      );

      return [token0, token1, tokenId, liquidity, amount0, amount1];
    } catch (error) {
      this.logger.error(
        'Error while easyDecreaseLiquidityCollect function in pool-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }

  async easyIncreaseLiquidityCompound(
    msgSender: AddressLike,
    tokenId: BigNumberish,
    amount0LiquidityDesired: BigNumberish,
    amount1LiquidityDesired: BigNumberish,
    amount0LiquidityMin: BigNumberish,
    amount1LiquidityMin: BigNumberish,
    amount0CollectMax: BigNumberish,
    amount1CollectMax: BigNumberish,
    deadline: BigNumberish,
  ): Promise<bigint[]> {
    // Processing data for DB Logging
    const funcName = 'easyIncreaseLiquidityCompound';
    let value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
      msgSender,
      tokenId,
      amount0LiquidityDesired,
      amount1LiquidityDesired,
      amount0LiquidityMin,
      amount1LiquidityMin,
      amount0CollectMax,
      amount1CollectMax,
      deadline,
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const NFPHelperWithSigner =
      this.NonfungiblePositionHelperContract.connect(senderWallet);

    const positionInfo = await this.getPositionInfo(tokenId);
    console.log('positionInfo from custom getter function : ' + positionInfo);
    const token0 = positionInfo.token0;
    const token1 = positionInfo.token1;

    // Converting the input in to Wei unit
    amount0LiquidityDesired = (await this.extendedEthersService.convertToWei(
      token0,
      amount0LiquidityDesired,
    )) as BigNumberish;
    amount1LiquidityDesired = (await this.extendedEthersService.convertToWei(
      token1,
      amount1LiquidityDesired,
    )) as BigNumberish;

    // Approval to Helper on User's Pool NFT is mandated
    try {
      await this.NonfungiblePositionManagerContract.connect(
        senderWallet,
      ).setApprovalForAll(this.NftPositionHelperAddress, true, {
        from: senderWallet.address,
        gasPrice: 110 * 10 ** 9,
      });
    } catch (err) {
      console.error(err);
    }

    await this.extendedEthersService.approveToken(
      token0,
      senderWallet,
      amount0LiquidityDesired,
      this.NftPositionHelperAddress,
    );
    await this.extendedEthersService.approveToken(
      token1,
      senderWallet,
      amount1LiquidityDesired,
      this.NftPositionHelperAddress,
    );

    if (token0 == this.wWemixAddress) {
      value = amount0LiquidityDesired as bigint;
      console.log(`token0 address : ${token0} / value : ${value}`);
    } else if (token1 == this.wWemixAddress) {
      value = amount1LiquidityDesired as bigint;
      console.log(`token1 address : ${token1} / value : ${value}`);
    }

    try {
      const easyIncreaseLiquidityCompoundParams = {
        tokenId,
        amount0LiquidityDesired,
        amount1LiquidityDesired,
        amount0LiquidityMin,
        amount1LiquidityMin,
        amount0CollectMax,
        amount1CollectMax,
        deadline,
      };

      const tx = await NFPHelperWithSigner.easyIncreaseLiquidityCompound(
        easyIncreaseLiquidityCompoundParams,
        { value },
      );

      const txReceipt = await tx.wait();

      const easyIncreaseLiquidityCompoundEvent = await this.getEventFromReceipt(
        txReceipt,
        'EasyIncreaseLiquidityCompound',
      );
      const [, , , liquidity, amount0, amount1] =
        easyIncreaseLiquidityCompoundEvent.args;

      return [token0, token1, tokenId, liquidity, amount0, amount1];
    } catch (error) {
      this.logger.error(
        'Error while easyIncreaseLiquidityCompound function in pool-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }

  async easyDecreaseLiquidityCollectAll(
    msgSender: AddressLike,
    tokenId: BigNumberish,
    liquidity: BigNumberish,
    amount0LiquidityMin: BigNumberish,
    amount1LiquidityMin: BigNumberish,
    deadline: BigNumberish,
  ): Promise<bigint[]> {
    // Processing data for DB Logging
    const funcName = 'easyDecreaseLiquidityCollectAll';
    const value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
      msgSender,
      tokenId,
      liquidity,
      amount0LiquidityMin,
      amount1LiquidityMin,
      deadline,
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const NFPHelperWithSigner =
      this.NonfungiblePositionHelperContract.connect(senderWallet);

    const positionInfo = await this.getPositionInfo(tokenId);
    console.log('positionInfo from custom getter function : ' + positionInfo);
    const token0 = positionInfo.token0;
    const token1 = positionInfo.token1;

    amount0LiquidityMin = (await this.extendedEthersService.convertToWei(
      token0,
      amount0LiquidityMin,
    )) as BigNumberish;
    amount1LiquidityMin = (await this.extendedEthersService.convertToWei(
      token1,
      amount1LiquidityMin,
    )) as BigNumberish;

    // Approval to Helper on User's Pool NFT is mandated
    try {
      await this.NonfungiblePositionManagerContract.connect(
        senderWallet,
      ).setApprovalForAll(this.NftPositionHelperAddress, true, {
        from: senderWallet.address,
        gasPrice: 110 * 10 ** 9,
      });
    } catch (err) {
      console.error(err);
    }

    try {
      const easyDecreaseLiquidityCollectAllParams = {
        tokenId,
        liquidity,
        amount0LiquidityMin,
        amount1LiquidityMin,
        deadline,
      };

      console.log('Right before easyDecreaseLidquidityCollect ');
      const tx = await NFPHelperWithSigner.easyDecreaseLiquidityCollectAll(
        easyDecreaseLiquidityCollectAllParams,
        { value },
      );

      const txReceipt = await tx.wait();

      const easyDecreaseLiquidityCollectAllEvent =
        await this.getEventFromReceipt(
          txReceipt,
          'EasyDecreaseLiquidityAllCollectAllBurn',
        );
      const [, , , , amount0, amount1] =
        easyDecreaseLiquidityCollectAllEvent.args;

      console.log(
        'Args in easyDecreaseLiquidity event : ' +
          easyDecreaseLiquidityCollectAllEvent.args,
      );

      return [token0, token1, tokenId, liquidity, amount0, amount1];
    } catch (error) {
      this.logger.error(
        'Error while easyDecreaseLiquidityCollectAll function in pool-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }

  async easyDecreaseLiquidityAllCollectAllBurn(
    msgSender: AddressLike,
    tokenId: BigNumberish,
    deadline: BigNumberish,
  ): Promise<bigint[]> {
    // Processing data for DB Logging
    const funcName = 'easyDecreaseLiquidityAllCollectAllBurn';
    const value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
      msgSender,
      tokenId,
      deadline,
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const NFPHelperWithSigner =
      this.NonfungiblePositionHelperContract.connect(senderWallet);

    // Approval to Helper on User's Pool NFT is mandated
    try {
      await this.NonfungiblePositionManagerContract.connect(
        senderWallet,
      ).setApprovalForAll(this.NftPositionHelperAddress, true, {
        from: senderWallet.address,
        gasPrice: 110 * 10 ** 9,
      });
    } catch (err) {
      console.error(err);
    }

    try {
      const easyDecreaseLiquidityAllCollectAllBurnParams = {
        tokenId,
        deadline,
      };

      // console.log("Right before easyDecreaseLidquidityCollect ")
      const tx =
        await NFPHelperWithSigner.easyDecreaseLiquidityAllCollectAllBurn(
          easyDecreaseLiquidityAllCollectAllBurnParams,
          { value },
        );

      const txReceipt = await tx.wait();

      const easyDecreaseLiquidityAllCollectAllBurnEvent =
        await this.getEventFromReceipt(
          txReceipt,
          'EasyDecreaseLiquidityAllCollectAllBurn',
        );
      const [token0, token1, , liquidity, amount0, amount1] =
        easyDecreaseLiquidityAllCollectAllBurnEvent.args;

      console.log(
        'Args in easyDecreaseLiquidity event : ' +
          easyDecreaseLiquidityAllCollectAllBurnEvent.args,
      );

      return [token0, token1, tokenId, liquidity, amount0, amount1];
    } catch (error) {
      this.logger.error(
        'Error while easyDecreaseLiquidityAllCollectAllBurn function in pool-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }

  async easyStrategyChangeAll(
    msgSender: AddressLike,
    tokenId: BigNumberish,
    fee: BigNumberish,
    tickLower: BigNumberish,
    tickUpper: BigNumberish,
    amount0MintDesired: BigNumberish,
    amount1MintDesired: BigNumberish,
    amount0MintMin: BigNumberish,
    amount1MintMin: BigNumberish,
    deadline: BigNumberish,
  ): Promise<bigint[]> {
    // Processing data for DB Logging
    const funcName = 'easyStrategyChangeAll';
    let value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
      msgSender,
      tokenId,
      fee,
      tickLower,
      tickUpper,
      amount0MintDesired,
      amount1MintDesired,
      amount0MintMin,
      amount1MintMin,
      deadline,
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const NFPHelperWithSigner =
      this.NonfungiblePositionHelperContract.connect(senderWallet);

    const positionInfo = await this.getPositionInfo(tokenId);
    console.log('positionInfo from custom getter function : ' + positionInfo);
    const token0 = positionInfo.token0;
    const token1 = positionInfo.token1;

    amount0MintDesired = (await this.extendedEthersService.convertToWei(
      token0,
      amount0MintDesired,
    )) as BigNumberish;
    amount1MintDesired = (await this.extendedEthersService.convertToWei(
      token1,
      amount1MintDesired,
    )) as BigNumberish;
    amount0MintMin = (await this.extendedEthersService.convertToWei(
      token0,
      amount0MintMin,
    )) as BigNumberish;
    amount1MintMin = (await this.extendedEthersService.convertToWei(
      token1,
      amount1MintMin,
    )) as BigNumberish;

    try {
      // Explicit Approve of Token not required?
      // Approve tokens
      await this.extendedEthersService.approveToken(
        token0,
        senderWallet,
        amount0MintDesired,
        this.NftPositionHelperAddress,
      );
      await this.extendedEthersService.approveToken(
        token1,
        senderWallet,
        amount1MintDesired,
        this.NftPositionHelperAddress,
      );

      if (token0 == this.wWemixAddress) {
        value = amount0MintDesired as bigint;
        console.log(`token0 address : ${token0} / value : ${value}`);
      } else if (token1 == this.wWemixAddress) {
        value = amount1MintDesired as bigint;
        console.log(`token1 address : ${token1} / value : ${value}`);
      }

      const easyStrategyChangeAllParams = {
        tokenId,
        fee,
        tickLower,
        tickUpper,
        amount0MintDesired,
        amount1MintDesired,
        amount0MintMin,
        amount1MintMin,
        deadline,
      };

      const tx = await NFPHelperWithSigner.easyStrategyChangeAll(
        easyStrategyChangeAllParams,
        { value },
      );

      const txReceipt = await tx.wait();

      const easyStrategyChangeAllEvent = await this.getEventFromReceipt(
        txReceipt,
        'strategyChangeAll',
      );
      // const [, , , liquidity, amount0, amount1] = easyStrategyChangeAllEvent.args;

      return easyStrategyChangeAllEvent.args;
    } catch (error) {
      this.logger.error(
        'Error while easyStrategyChangeAll function in pool-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }

  // --- Internal Functions ---
  async getEventFromReceipt(
    txReceipt: ethers.ContractTransactionReceipt,
    eventName: string,
  ): Promise<ethers.EventLog> {
    const events = txReceipt.logs?.filter(
      (e: any) => e.eventName === eventName,
    ) as ethers.EventLog[];

    // Check if there are one or more events of the specified type
    if (!events || events.length === 0) {
      throw new Error(`${eventName} event not found or not properly formatted`);
    }

    if (events.length > 1) {
      throw new Error(`Multiple ${eventName} events found`);
    }

    return events[0];
  }
}
