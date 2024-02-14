import { Injectable, Logger } from '@nestjs/common';
import { BigNumberish, AddressLike, ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';
import { ExtendedEthersService } from 'src/extended-ethers/extended-ethers.service';

import * as nonfungiblePositionHelperJson from '../../wemixfi_env/NonfungiblePositionHelper.json';
import { NonfungiblePositionHelper } from '../../types/ethers/NonfungiblePositionHelper';

import * as nonfungiblePositionManagerJson from '../../wemixfi_env/NonfungiblePositionManager.json';
import { NonfungiblePositionManager } from 'types/ethers/NonfungiblePositionManager';

import { contractInfos, CA } from 'wemixfi_env/contractInfo_testnet'; // CA: Contract Address

const contractName: string = 'NonfungiblePositionHelper';

@Injectable()
export class PoolV3Service {
  private readonly wWemixAddress = CA.wWemix;

  private readonly NftPositionHelperAddress = CA.nftPositionHelper;
  private readonly NftPositionManagerAddress = CA.nftPositionManager;

  private NonfungiblePositionHelperContract: NonfungiblePositionHelper;
  private NonfungiblePositionManagerContract: NonfungiblePositionManager;

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
  async getPositionInfo(tokenId: number) {
    const positionInfo =
      await this.NonfungiblePositionManagerContract.positions(tokenId);
  
    const formattedPositionInfo = {
      nonce: positionInfo.nonce.toString(), 
      operator: positionInfo.operator,
      token0: positionInfo.token0,
      token1: positionInfo.token1,
      fee: positionInfo.fee.toString(),
      tickLower: positionInfo.tickLower.toString(),
      tickUpper: positionInfo.tickUpper.toString(),
      liquidity: positionInfo.liquidity.toString(),
      feeGrowthInside0LastX128: positionInfo.feeGrowthInside0LastX128.toString(),
      feeGrowthInside1LastX128: positionInfo.feeGrowthInside1LastX128.toString(),
      tokensOwed0: positionInfo.tokensOwed0.toString(),
      tokensOwed1: positionInfo.tokensOwed1.toString()
    };
  
    return formattedPositionInfo;
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
  ): Promise<any> {
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

      const mintEvent = await this.extendedEthersService.catchEventFromReceipt(
        txReceipt,
        'EasyMint',
      );

      const [, , tokenId, liquidity, amount0, amount1] = mintEvent.args;

      ///

      const logObject = await this.databaseService.createPoolV3LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        token0 as string,
        token1 as string,
        tokenId,
        liquidity,
        amount0,
        amount1,
      );

      await this.databaseService.logPoolV3Tx(logObject);

      // return [token0, token1, tokenId, liquidity, amount0, amount1];
      const easyMintResponse = {
        token0: mintEvent.args.token0,
        token1: mintEvent.args.token1,
        tokenId: mintEvent.args.tokenId.toString(),
        liquidity: mintEvent.args.liquidity.toString(),
        amount0: mintEvent.args.amount0.toString(),
        amount1: mintEvent.args.amount1.toString()
      };

      return easyMintResponse

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
    tokenId: number,
    amount0Desired: BigNumberish,
    amount1Desired: BigNumberish,
    amount0Min: BigNumberish,
    amount1Min: BigNumberish,
    deadline: BigNumberish,
  ): Promise<any> {
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

      const increaseLiquidityEvent =
        await this.extendedEthersService.catchEventFromReceipt(
          txReceipt,
          'IncreaseLiquidity',
        );
      const { liquidity, amount0, amount1 } = increaseLiquidityEvent.args;

      console.log(increaseLiquidityEvent.args);

      const logObject = await this.databaseService.createPoolV3LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        token0 as string,
        token1 as string,
        tokenId,
        liquidity,
        amount0,
        amount1,
      );

      await this.databaseService.logPoolV3Tx(logObject);

      // return [token0, token1, tokenId, liquidity, amount0, amount1];
      const increaseLiquidityResponse = {
        token0: increaseLiquidityEvent.args.token0,
        token1: increaseLiquidityEvent.args.token1,
        tokenId: increaseLiquidityEvent.args.tokenId.toString(),
        liquidity: increaseLiquidityEvent.args.liquidity.toString(),
        amount0: increaseLiquidityEvent.args.amount0.toString(),
        amount1: increaseLiquidityEvent.args.amount1.toString()
      };

      return increaseLiquidityResponse;

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
    tokenId: number,
    amount0Max: BigNumberish,
    amount1Max: BigNumberish,
  ): Promise<any> {
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

      const easyCollectEvent =
        await this.extendedEthersService.catchEventFromReceipt(
          txReceipt,
          'EasyCollect',
        );
      // const [, , liquidity, amount0, amount1] = easyCollectEvent.args;
      const { amount0, amount1 } = easyCollectEvent.args;
      const liquidity = 0n;

      const logObject = await this.databaseService.createPoolV3LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        token0 as string,
        token1 as string,
        tokenId,
        liquidity,
        amount0,
        amount1,
      );

      await this.databaseService.logPoolV3Tx(logObject);

      // return [tokenId, token0, token1, liquidity, amount0, amount1];
      const easyCollectResponse = {
        token0: easyCollectEvent.args.token0,
        token1: easyCollectEvent.args.token1,
        tokenId: easyCollectEvent.args.tokenId.toString(),
        amount0: easyCollectEvent.args.amount0.toString(),
        amount1: easyCollectEvent.args.amount1.toString()
      };

      return easyCollectResponse
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
    tokenId: number,
    amount0CollectMax: BigNumberish,
    amount1CollectMax: BigNumberish,
    amount0LiquidityMin: BigNumberish,
    amount1LiquidityMin: BigNumberish,
    deadline: BigNumberish,
  ): Promise<any> {
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

      const easyCompoundEvent =
        await this.extendedEthersService.catchEventFromReceipt(
          txReceipt,
          'EasyCompound',
        );
      const { liquidity, amount0, amount1 } = easyCompoundEvent.args;

      const logObject = await this.databaseService.createPoolV3LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        token0 as string,
        token1 as string,
        tokenId,
        liquidity,
        amount0,
        amount1,
      );

      await this.databaseService.logPoolV3Tx(logObject);

      const easyCompoundResponse = {
        token0: easyCompoundEvent.args.token0,
        token1: easyCompoundEvent.args.token1,
        liquidity: easyCompoundEvent.args.liquidity.toString(),
        amount0: easyCompoundEvent.args.amount0.toString(),
        amount1: easyCompoundEvent.args.amount1.toString()
      };

      return easyCompoundResponse;
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
    tokenId: number,
    liquidity: BigNumberish,
    amount0LiquidityMin: BigNumberish,
    amount1LiquidityMin: BigNumberish,
    amount0CollectMax: BigNumberish,
    amount1CollectMax: BigNumberish,
    deadline: BigNumberish,
  ): Promise<any> {
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

      const easyDecreaseLiquidityCollectEvent =
        await this.extendedEthersService.catchEventFromReceipt(
          txReceipt,
          'EasyDecreaseLiquidityCollectAll',
        );
      const { amount0, amount1 } = easyDecreaseLiquidityCollectEvent.args;

      console.log(
        'Args in easyDecreaseLiquidity event : ' +
          easyDecreaseLiquidityCollectEvent.args,
      );

      const logObject = await this.databaseService.createPoolV3LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        token0 as string,
        token1 as string,
        tokenId,
        liquidity as bigint,
        amount0,
        amount1,
      );

      await this.databaseService.logPoolV3Tx(logObject);

      const easyDecreaseLiquidityCollectAllResponse = {
        token0: easyDecreaseLiquidityCollectEvent.args.token0,
        token1: easyDecreaseLiquidityCollectEvent.args.token1,
        tokenId: easyDecreaseLiquidityCollectEvent.args.tokenId.toString(),
        liquidity: easyDecreaseLiquidityCollectEvent.args.liquidity.toString(),
        amount0: easyDecreaseLiquidityCollectEvent.args.amount0.toString(),
        amount1: easyDecreaseLiquidityCollectEvent.args.amount1.toString()
      };

      return easyDecreaseLiquidityCollectAllResponse
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
    tokenId: number,
    amount0LiquidityDesired: BigNumberish,
    amount1LiquidityDesired: BigNumberish,
    amount0LiquidityMin: BigNumberish,
    amount1LiquidityMin: BigNumberish,
    amount0CollectMax: BigNumberish,
    amount1CollectMax: BigNumberish,
    deadline: BigNumberish,
  ): Promise<any> {
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

      const easyIncreaseLiquidityCompoundEvent =
        await this.extendedEthersService.catchEventFromReceipt(
          txReceipt,
          'EasyIncreaseLiquidityCompound',
        );
      const { liquidity, amount0, amount1 } =
        easyIncreaseLiquidityCompoundEvent.args;

      const logObject = await this.databaseService.createPoolV3LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        token0 as string,
        token1 as string,
        tokenId,
        liquidity as bigint,
        amount0,
        amount1,
      );

      await this.databaseService.logPoolV3Tx(logObject);

      const easyIncreaseLiquidityCompoundResponse = {
        token0: easyIncreaseLiquidityCompoundEvent.args.token0,
        token1: easyIncreaseLiquidityCompoundEvent.args.token1,
        tokenId: easyIncreaseLiquidityCompoundEvent.args.tokenId.toString(),
        liquidity: easyIncreaseLiquidityCompoundEvent.args.liquidity.toString(),
        amount0: easyIncreaseLiquidityCompoundEvent.args.amount0.toString(),
        amount1: easyIncreaseLiquidityCompoundEvent.args.amount1.toString()
      };

      return easyIncreaseLiquidityCompoundResponse

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
    tokenId: number,
    liquidity: BigNumberish,
    amount0LiquidityMin: BigNumberish,
    amount1LiquidityMin: BigNumberish,
    deadline: BigNumberish,
  ): Promise<any> {
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
        await this.extendedEthersService.catchEventFromReceipt(
          txReceipt,
          'EasyDecreaseLiquidityAllCollectAllBurn',
        );
      const { amount0, amount1 } = easyDecreaseLiquidityCollectAllEvent.args;

      const logObject = await this.databaseService.createPoolV3LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        token0 as string,
        token1 as string,
        tokenId,
        liquidity as bigint,
        amount0,
        amount1,
      );

      await this.databaseService.logPoolV3Tx(logObject);

      const easyDecreaseLiquidityAllCollectAllBurnResponse = {
        token0: easyDecreaseLiquidityCollectAllEvent.args.token0,
        token1: easyDecreaseLiquidityCollectAllEvent.args.token1,
        tokenId: easyDecreaseLiquidityCollectAllEvent.args.tokenId.toString(),
        liquidity: easyDecreaseLiquidityCollectAllEvent.args.liquidity.toString(),
        amount0: easyDecreaseLiquidityCollectAllEvent.args.amount0.toString(),
        amount1: easyDecreaseLiquidityCollectAllEvent.args.amount1.toString()
      };

      return easyDecreaseLiquidityAllCollectAllBurnResponse;

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
    tokenId: number,
    deadline: BigNumberish,
  ): Promise<any> {
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
        await this.extendedEthersService.catchEventFromReceipt(
          txReceipt,
          'EasyDecreaseLiquidityAllCollectAllBurn',
        );
      const [token0, token1, , liquidity, amount0, amount1] =
        easyDecreaseLiquidityAllCollectAllBurnEvent.args;

      console.log(
        'Args in easyDecreaseLiquidity event : ' +
          easyDecreaseLiquidityAllCollectAllBurnEvent.args,
      );

      const logObject = await this.databaseService.createPoolV3LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        token0 as string,
        token1 as string,
        tokenId,
        liquidity as bigint,
        amount0,
        amount1,
      );

      await this.databaseService.logPoolV3Tx(logObject);

      const easyDecreaseLiquidityAllCollectAllBurnResponse = {
        token0: easyDecreaseLiquidityAllCollectAllBurnEvent.args.token0,
        token1: easyDecreaseLiquidityAllCollectAllBurnEvent.args.token1,
        tokenId: easyDecreaseLiquidityAllCollectAllBurnEvent.args.tokenId.toString(),
        liquidity: easyDecreaseLiquidityAllCollectAllBurnEvent.args.liquidity.toString(),
        amount0: easyDecreaseLiquidityAllCollectAllBurnEvent.args.amount0.toString(),
        amount1: easyDecreaseLiquidityAllCollectAllBurnEvent.args.amount1.toString()
      };

      
      return easyDecreaseLiquidityAllCollectAllBurnResponse;
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
    tokenId: number,
    fee: BigNumberish,
    tickLower: BigNumberish,
    tickUpper: BigNumberish,
    amount0MintDesired: BigNumberish,
    amount1MintDesired: BigNumberish,
    amount0MintMin: BigNumberish,
    amount1MintMin: BigNumberish,
    deadline: BigNumberish,
  ): Promise<any> {
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

      const easyStrategyChangeAllEvent =
        await this.extendedEthersService.catchEventFromReceipt(
          txReceipt,
          'strategyChangeAll',
        );

      const { liquidity, amount0, amount1 } = easyStrategyChangeAllEvent.args;

      const logObject = await this.databaseService.createPoolV3LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        token0 as string,
        token1 as string,
        tokenId,
        liquidity as bigint,
        amount0,
        amount1,
      );

      await this.databaseService.logPoolV3Tx(logObject);

      const strategyChangeAllResponse = {
        token0: easyStrategyChangeAllEvent.args.token0,
        token1: easyStrategyChangeAllEvent.args.token1,
        fee: easyStrategyChangeAllEvent.args.fee.toString(),
        tokenId: easyStrategyChangeAllEvent.args.tokenId.toString(),
        liquidity: easyStrategyChangeAllEvent.args.liquidity.toString(),
        amount0: easyStrategyChangeAllEvent.args.amount0.toString(),
        amount1: easyStrategyChangeAllEvent.args.amount1.toString()
      };

      return strategyChangeAllResponse;
    } catch (error) {
      this.logger.error(
        'Error while easyStrategyChangeAll function in pool-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }
}
