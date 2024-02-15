import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';
import { ExtendedEthersService } from 'src/extended-ethers/extended-ethers.service';

import * as ERC20Json from '../../wemixfi_env/ERC20.json';
// import { ERC20 } from '../../types/ethers/ERC20';

// import * as WWEMIXJson from '../../wemixFi_env/WWEMIX.json';
// import * as WeswapPairJson from '../../wemixFi_env/WeswapPair.json';
// import * as WemixDollarJson from '../../wemixFi_env/WemixDollar.json';

import * as weswapRouterJson from '../../wemixfi_env/WeswapRouter.json';
import { WeswapRouter } from '../../types/ethers/WeswapRouter';

import * as IWeswapFactoryJson from '../../wemixfi_env/IWeswapFactory.json';
import { IWeswapFactory } from '../../types/ethers/IWeswapFactory';

import { contractInfos, CA } from 'wemixfi_env/contractInfo_testnet';

const contractName: string = 'WeswapRouter';

// !!! Currently can't detect if a certain pair input is valid in 'WemixFi' thus throwing a Error which is not directly stating this situation
@Injectable()
export class SwapService {
  private readonly wWemixAddress = CA.wWemix;

  private readonly weswapRouterAddress = CA.router;
  private readonly weswapFactoryAddress = CA.factory; // factory : swapV2 factory

  private weswapRouterContract: WeswapRouter;
  private weswapFactoryContract: IWeswapFactory;

  private readonly ERC20ContractABI = ERC20Json.abi;
  private readonly weswapRouterContractABI = weswapRouterJson.abi;
  private readonly weswapFactoryContractABI = IWeswapFactoryJson.abi;

  constructor(
    private databaseService: DatabaseService,
    private accountService: AccountService,
    private extendedEthersService: ExtendedEthersService,
  ) {
    const provider = this.databaseService.provider();
    this.weswapRouterContract = new ethers.Contract(
      this.weswapRouterAddress,
      this.weswapRouterContractABI,
      provider,
    ) as unknown as WeswapRouter;
    // weSwapFactory connect
    this.weswapFactoryContract = new ethers.Contract(
      this.weswapFactoryAddress,
      this.weswapFactoryContractABI,
      provider,
    ) as unknown as IWeswapFactory;
  }

  private readonly logger = new Logger(SwapService.name);

  async getQuote(
    amount: number,
    reserveAAmount: number,
    reserveBAmount: number,
  ): Promise<bigint> {
    try {
      const amountInWei = ethers.parseEther(amount.toString());
      const reserveAAmountInWei = ethers.parseEther(reserveAAmount.toString());
      const reserveBAmountInWei = ethers.parseEther(reserveBAmount.toString());
      const quoteResultInWei = await this.weswapRouterContract.quote(
        amountInWei,
        reserveAAmountInWei,
        reserveBAmountInWei,
      );
      const quoteResult = quoteResultInWei / 1000000000000000000n; // divided by 1e18
      this.logger.debug('getQuote returning amount to Asset B ');
      return quoteResult;
    } catch (error) {
      this.logger.error('Error while getQuote in swap.service.ts : ', error);
      throw error;
    }
  }

  async getAmountOut(
    amount: number,
    reserveIn: number,
    reserveOut: number,
  ): Promise<bigint> {
    try {
      const amountOut = await this.weswapRouterContract.getAmountOut(
        amount,
        reserveIn,
        reserveOut,
      );
      this.logger.debug('getAmountOut from weswapRouter ');
      return amountOut;
    } catch (error) {
      this.logger.error(
        'Error while getAmountOut in swap.service.ts : ',
        error,
      );
      throw error;
    }
  }

  async getAmountIn(
    amount: number,
    reserveIn: number,
    reserveOut: number,
  ): Promise<bigint> {
    try {
      const amountOut = await this.weswapRouterContract.getAmountIn(
        amount,
        reserveIn,
        reserveOut,
      );
      this.logger.debug('getAmountIn from weswapRouter ');
      return amountOut;
    } catch (error) {
      this.logger.error('Error while getAmountIn in swap.service.ts : ', error);
      throw error;
    }
  }

  async getAmountsOut(amount: number, path: string[]): Promise<bigint[]> {
    try {
      const amountInWei = ethers.parseEther(amount.toString());
      this.logger.debug('path in getAmountsOut ', path);
      const amountsArray = await this.weswapRouterContract.getAmountsOut(
        amountInWei,
        path,
      );
      // this.logger.debug('type of array element : ' + typeof amountsArray[0])
      return amountsArray;
    } catch (error) {
      this.logger.error(
        'Error while getAmountsOut in swap.service.ts : ',
        error,
      );
      console.log(error);
      throw error;
    }
  }

  async getAmountsIn(amount: number, path: string[]): Promise<bigint[]> {
    try {
      const amountInWei = ethers.parseEther(amount.toString());
      const amountsArray = await this.weswapRouterContract.getAmountsIn(
        amountInWei,
        path,
      );
      this.logger.debug('getAmountsIn...Out from SwapV2 Router ');
      return amountsArray;
    } catch (error) {
      this.logger.error(
        'Error while getAmountsIn in swap.service.ts : ',
        error,
      );
      console.log(error);
      throw error;
    }
  }

  // Swap Exact Token <-> Token
  // #1
  async swapExactTokensForTokens(
    msgSender: string,
    amountIn: number,
    amountOutMin: number,
    path: string[],
    to: string,
    deadline: number,
  ): Promise<{ swapInAmount: bigint; swapOutAmount: bigint }> {
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const weswapRouterContractWithSigner =
      this.weswapRouterContract.connect(senderWallet);

    const amountInWei = await this.extendedEthersService.convertToWei(
      path[0],
      amountIn,
    );
    const amountOutMinWei = await this.extendedEthersService.convertToWei(
      path[path.length - 1],
      amountOutMin,
    );

    //
    const funcName = 'swapExactTokensForTokens';
    const value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
      msgSender,
      amountIn,
      amountOutMin,
      path,
      to,
      deadline,
    });
    const input: string = JSON.stringify(inputJson);
    //

    await this.extendedEthersService.approveToken(
      path[0],
      senderWallet,
      amountInWei,
      this.weswapRouterAddress,
    );

    try {
      const tx = await weswapRouterContractWithSigner.swapExactTokensForTokens(
        amountInWei,
        amountOutMinWei,
        path,
        to,
        deadline,
      );

      const txReceipt = await tx.wait();

      // Input Amount of certain asset => use amountIn from User Input, Output Amount of certain asset => extract from 'Swap' event.
      const swapInAmount = amountInWei;
      const swapOutAmount = await this.getSwapAmountOut(
        txReceipt,
        path[path.length - 2],
        path[path.length - 1],
      );

      if (swapOutAmount) {
        this.logger.debug(
          `Swap Event Emitted, swapAmountIn ${swapInAmount}, Out ${swapOutAmount} `,
        );
      } else {
        this.logger.debug('Swap Out Amount calculated to 0');
      }

      const logObject = await this.databaseService.createSwapV2LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        path[0],
        swapInAmount,
        path[path.length - 1],
        swapOutAmount,
      );

      await this.databaseService.logSwapV2Tx(logObject);

      return { swapInAmount, swapOutAmount };
    } catch (error) {
      this.logger.error('Error while swapping tokens: ', error);
      throw new Error('Error while swapping tokens: ' + error.message);
    }
  }

  // #2
  async swapTokensForExactTokens(
    msgSender: string,
    amountOut: number,
    amountInMax: number,
    path: string[],
    to: string,
    deadline: number,
  ): Promise<{ swapInAmount: bigint; swapOutAmount: bigint }> {
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const weswapRouterContractWithSigner =
      this.weswapRouterContract.connect(senderWallet);

    const amountInMaxWei = await this.extendedEthersService.convertToWei(
      path[0],
      amountInMax,
    );
    const amountOutWei = await this.extendedEthersService.convertToWei(
      path[path.length - 1],
      amountOut,
    );

    // await this.approvePathTokens(path, senderWallet, amountInMaxWei, this.weswapRouterAddress);
    await this.extendedEthersService.approveToken(
      path[0],
      senderWallet,
      amountInMaxWei,
      this.weswapRouterAddress,
    );

    try {
      const tx = await weswapRouterContractWithSigner.swapTokensForExactTokens(
        amountOutWei,
        amountInMaxWei,
        path,
        to,
        deadline,
      );

      const txReceipt = await tx.wait();

      const funcName = 'swapTokensForExactTokens';
      const value: bigint = 0n; // Wemix amount sent with Tx
      const inputJson = JSON.stringify({
        msgSender,
        amountOut,
        amountInMax,
        path,
        to,
        deadline,
      });
      const input: string = JSON.stringify(inputJson);

      const swapInAmount = await this.getSwapAmountIn(
        txReceipt,
        path[0],
        path[1],
      );
      const swapOutAmount = amountOutWei;

      if (swapInAmount) {
        this.logger.debug(
          `Swap Event Emitted, AmountIn ${swapInAmount}, Out ${amountOutWei} `,
        );
      } else {
        this.logger.debug('Swap In Amount calculated to 0');
      }

      const logObject = await this.databaseService.createSwapV2LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        path[0],
        swapInAmount,
        path[path.length - 1],
        amountOutWei,
      );

      await this.databaseService.logSwapV2Tx(logObject);

      return { swapInAmount, swapOutAmount };
    } catch (error) {
      this.logger.error(
        'Error while swapping tokens for exact tokens: ',
        error,
      );
      throw error;
    }
  }

  // Swap Exact WEMIX <-> Token
  // #3
  async swapExactWEMIXForTokens(
    msgSender: string,
    amountIn: number,
    amountOutMin: number,
    path: string[],
    to: string,
    deadline: number,
  ): Promise<{ swapInAmount: bigint; swapOutAmount: bigint }> {
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const weswapRouterContractWithSigner =
      this.weswapRouterContract.connect(senderWallet);

    const amountInWei = ethers.parseEther(amountIn.toString());
    const amountOutMinWei = await this.extendedEthersService.convertToWei(
      path[path.length - 1],
      amountOutMin,
    );

    await this.extendedEthersService.approveToken(
      path[0],
      senderWallet,
      amountInWei,
      this.weswapRouterAddress,
    );

    try {
      const tx = await weswapRouterContractWithSigner.swapExactWEMIXForTokens(
        amountOutMinWei,
        path,
        to,
        deadline,
        { value: amountInWei },
      );

      const txReceipt = await tx.wait();
      // -- DB Work --
      const funcName = 'swapExactWEMIXForTokens';
      const value: bigint = amountInWei; // Wemix amount sent with Tx
      const inputJson = JSON.stringify({
        msgSender,
        amountIn,
        amountOutMin,
        path,
        to,
        deadline,
      });
      const input: string = JSON.stringify(inputJson);

      const swapInAmount = amountInWei;
      const swapOutAmount = await this.getSwapAmountOut(
        txReceipt,
        path[path.length - 2],
        path[path.length - 1],
      );

      if (swapOutAmount) {
        this.logger.debug(
          `Swap Event Emitted, swapAmountIn ${swapInAmount}, Out ${swapOutAmount} `,
        );
      } else {
        this.logger.debug('Swap Out Amount calculated to 0');
      }

      const logObject = await this.databaseService.createSwapV2LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        path[0],
        swapInAmount,
        path[path.length - 1],
        swapOutAmount,
      );

      await this.databaseService.logSwapV2Tx(logObject);

      return { swapInAmount, swapOutAmount };
      // return true;
    } catch (error) {
      this.logger.error('Error while swapping WEMIX for tokens: ', error);
      throw error;
    }
  }

  // #4
  async swapTokensForExactWEMIX(
    msgSender: string,
    amountOut: number,
    amountInMax: number,
    path: string[],
    to: string,
    deadline: number,
  ): Promise<{ swapInAmount: bigint; swapOutAmount: bigint }> {
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const weswapRouterContractWithSigner =
      this.weswapRouterContract.connect(senderWallet);

    const amountInMaxWei = await this.extendedEthersService.convertToWei(
      path[0],
      amountInMax,
    );
    const amountOutWei = ethers.parseEther(amountOut.toString()); // WEMIX is the output and has 18 decimals

    await this.extendedEthersService.approveToken(
      path[0],
      senderWallet,
      amountInMaxWei,
      this.weswapRouterAddress,
    );

    try {
      const tx = await weswapRouterContractWithSigner.swapTokensForExactWEMIX(
        amountOutWei,
        amountInMaxWei,
        path,
        to,
        deadline,
      );

      const txReceipt = await tx.wait();

      const funcName = 'swapTokensForExactWEMIX';
      const value: bigint = 0n; // Wemix amount sent with Tx
      const inputJson = JSON.stringify({
        msgSender,
        amountOut,
        amountInMax,
        path,
        to,
        deadline,
      });
      const input: string = JSON.stringify(inputJson);

      const swapInAmount = await this.getSwapAmountIn(
        txReceipt,
        path[0],
        path[1],
      );
      const swapOutAmount = amountOutWei;

      if (swapInAmount) {
        this.logger.debug(
          `Swap Event Emitted, AmountIn ${swapInAmount}, Out ${amountOutWei} `,
        );
      } else {
        this.logger.debug('Swap In Amount calculated to 0');
      }

      const logObject = await this.databaseService.createSwapV2LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        path[0],
        swapInAmount,
        path[path.length - 1],
        amountOutWei,
      );

      await this.databaseService.logSwapV2Tx(logObject);

      return { swapInAmount, swapOutAmount };
    } catch (error) {
      this.logger.error('Error while swapping tokens for WEMIX: ', error);
      throw error;
    }
  }

  // Swap Exact Token <-> WEMIX
  // #5
  async swapExactTokensForWEMIX(
    msgSender: string,
    amountIn: number,
    amountOutMin: number,
    path: string[],
    to: string,
    deadline: number,
  ): Promise<{ swapInAmount: bigint; swapOutAmount: bigint }> {
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const weswapRouterContractWithSigner =
      this.weswapRouterContract.connect(senderWallet);

    const amountInWei = await this.extendedEthersService.convertToWei(
      path[0],
      amountIn,
    );
    const amountOutMinWei = ethers.parseEther(amountOutMin.toString());

    await this.extendedEthersService.approveToken(
      path[0],
      senderWallet,
      amountInWei,
      this.weswapRouterAddress,
    );

    try {
      const tx = await weswapRouterContractWithSigner.swapExactTokensForWEMIX(
        amountInWei,
        amountOutMinWei,
        path,
        to,
        deadline,
      );

      const txReceipt = await tx.wait();
      // -- DB Work --
      const funcName = 'swapExactTokensForWEMIX';
      const value: bigint = 0n; // Wemix amount sent with Tx
      const inputJson = JSON.stringify({
        msgSender,
        amountIn,
        amountOutMin,
        path,
        to,
        deadline,
      });
      const input: string = JSON.stringify(inputJson);

      const swapInAmount = amountInWei;
      const swapOutAmount = await this.getSwapAmountOut(
        txReceipt,
        path[path.length - 2],
        path[path.length - 1],
      );

      if (swapOutAmount) {
        this.logger.debug(
          `Swap Event Emitted, swapAmountIn ${swapInAmount}, Out ${swapOutAmount} `,
        );
      } else {
        this.logger.debug('Swap Out Amount calculated to 0 or undefined');
      }

      const logObject = await this.databaseService.createSwapV2LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        path[0],
        swapInAmount,
        path[path.length - 1],
        swapOutAmount,
      );

      await this.databaseService.logSwapV2Tx(logObject);

      return { swapInAmount, swapOutAmount };
    } catch (error) {
      this.logger.error('Error while swapping Exact Token -> WEMIX : ', error);
      throw error;
    }
  }

  // #6
  async swapWEMIXForExactTokens(
    msgSender: string,
    amountOut: number,
    amountInMax: number,
    path: string[],
    to: string,
    deadline: number,
  ): Promise<{ swapInAmount: bigint; swapOutAmount: bigint }> {
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const weswapRouterContractWithSigner =
      this.weswapRouterContract.connect(senderWallet);

    const amountInMaxWei = ethers.parseEther(amountInMax.toString()); // WWemix has 18 decimals by default
    const amountOutWei = await this.extendedEthersService.convertToWei(
      path[path.length - 1],
      amountOut,
    );

    await this.extendedEthersService.approveToken(
      path[0],
      senderWallet,
      amountInMaxWei,
      this.weswapRouterAddress,
    );

    try {
      const tx = await weswapRouterContractWithSigner.swapWEMIXForExactTokens(
        amountOutWei,
        path,
        to,
        deadline,
        { value: amountInMaxWei },
      );

      const txReceipt = await tx.wait();

      const funcName = 'swapWEMIXForExactTokens';
      const value: bigint = amountInMaxWei;
      const inputJson = JSON.stringify({
        msgSender,
        amountOut,
        amountInMax,
        path,
        to,
        deadline,
      });
      const input: string = JSON.stringify(inputJson);

      const swapInAmount = await this.getSwapAmountIn(
        txReceipt,
        path[0],
        path[1],
      );
      const swapOutAmount = amountOutWei;

      if (swapInAmount) {
        this.logger.debug(
          `Swap Event Emitted, AmountIn ${swapInAmount}, Out ${amountOutWei} `,
        );
      } else {
        this.logger.debug('Swap In Amount calculated to 0');
      }

      const logObject = await this.databaseService.createSwapV2LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        path[0],
        swapInAmount,
        path[path.length - 1],
        amountOutWei,
      );

      await this.databaseService.logSwapV2Tx(logObject);

      return { swapInAmount, swapOutAmount };
    } catch (error) {
      this.logger.error('Error while swapping WEMIX for Exact Token : ', error);
      throw error;
    }
  }

  async getSwapAmountOut(
    txReceipt,
    tokenIn: string,
    tokenOut: string,
  ): Promise<bigint | undefined> {
    const swapEvent = await this.extendedEthersService.catchEventFromReceipt(
      txReceipt,
      'Swap',
      true,
    );

    const { amount0Out, amount1Out } = swapEvent.args;

    if (tokenOut < tokenIn) {
      console.log('tokenOut : amount0 => :' + amount0Out);
      return amount0Out;
    } else {
      console.log('tokenOut : amount1 => :' + amount1Out);
      return amount1Out;
    }
  }

  async getSwapAmountIn(
    txReceipt,
    tokenIn: string,
    tokenOut: string,
  ): Promise<bigint | undefined> {
    const swapEvent = await this.extendedEthersService.catchEventFromReceipt(
      txReceipt,
      'Swap',
    );

    const { amount0In, amount1In } = swapEvent.args;

    if (tokenIn < tokenOut) {
      console.log('tokenOut : amount0 => :' + amount0In);
      return amount0In;
    } else {
      console.log('tokenOut : amount1 => :' + amount1In);
      return amount1In;
    }
  }
}
