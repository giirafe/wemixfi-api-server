import { Injectable, Logger } from '@nestjs/common';
import { BigNumberish, AddressLike, ethers, BytesLike } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';
import { ExtendedEthersService } from 'src/extended-ethers/extended-ethers.service';
import { HttpService } from '@nestjs/axios';

// import * as swapRouterV3Json from '../../wemixFi_env/SwapRouterV3.json';
// import { SwapRouterV3 } from '../../types/ethers/SwapRouterV3';

import * as swapRouterHelperJson from '../../wemixfi_env/SwapRouterHelper.json';
import { SwapRouterHelper } from 'types/ethers/SwapRouterHelper';
import { contractInfos, CA } from 'wemixfi_env/contractInfo_testnet'; // CA: Contract Address
import { AxiosError, AxiosResponse } from 'axios';
import { Observable, catchError, firstValueFrom } from 'rxjs';

const contractName: string = 'NonfungiblePositionHelper';

@Injectable()
export class SwapV3Service {
  private readonly wWemixAddress = CA.wWemix;

  private readonly SwapRouterHelperAddress = CA.swapRouterV3;

  private SwapRouterHelperContract: SwapRouterHelper;

  private readonly SwapRouterHelperContractABI = swapRouterHelperJson.abi;

  constructor(
    private databaseService: DatabaseService,
    private accountService: AccountService,
    private extendedEthersService: ExtendedEthersService,
    private httpService: HttpService,
  ) {
    const provider = this.databaseService.provider();

    this.SwapRouterHelperContract = new ethers.Contract(
      this.SwapRouterHelperAddress,
      this.SwapRouterHelperContractABI,
      provider,
    ) as unknown as SwapRouterHelper;
  }

  private readonly logger = new Logger(SwapV3Service.name);

  async exactInput(
    msgSender: AddressLike,
    tokenIn: AddressLike,
    tokenOut: AddressLike,
    recipient: AddressLike,
    deadline: number,
    amountIn: BigNumberish,
    amountOutMinimum: BigNumberish,
  ): Promise<any> {
    // Processing data for DB Logging
    // ----
    const funcName = 'exactInput';
    let value: bigint = 0n; // Wemix amount sent with Tx
    const inputJson = JSON.stringify({
      msgSender,
      tokenIn,
      tokenOut,
      recipient,
      deadline,
      amountIn,
      amountOutMinimum,
    });
    const input: string = JSON.stringify(inputJson);
    ///----

    amountIn = (await this.extendedEthersService.convertToWei(
      tokenIn,
      amountIn,
    )) as BigNumberish;
    amountOutMinimum = (await this.extendedEthersService.convertToWei(
      tokenOut,
      amountOutMinimum,
    )) as BigNumberish;

    const encodedBestPath = await this.findBestPath(
      tokenIn,
      tokenOut,
      amountIn,
    );

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(msgSender);
    const SwapRouterWithSigner =
      this.SwapRouterHelperContract.connect(senderWallet);

    try {
      this.extendedEthersService.approveToken(
        tokenIn,
        senderWallet,
        amountIn,
        this.SwapRouterHelperAddress,
      );
    } catch (error) {
      this.logger.error(
        'Error while approving token in exactInput function in swap-v3.service.ts: ',
        error,
      );
      throw error;
    }

    try {
      if (tokenIn == this.wWemixAddress) {
        // In case of swapping wWemix (IN)
        value = amountIn as bigint;
        console.log(`wWemix Address : ${tokenIn} / value : ${value}`);
      }

      const exactInputParams = {
        path: encodedBestPath,
        recipient,
        deadline,
        amountIn,
        amountOutMinimum,
      };

      const currentGasPrice = (
        await this.extendedEthersService.provider().getFeeData()
      ).gasPrice;

      // Doubling the gasPrice on tx due to "STF, replacement fee too low" Errors
      const higherGasPrice = currentGasPrice + currentGasPrice;

      const tx = await SwapRouterWithSigner.exactInput(exactInputParams, {
        value,
        gasPrice: higherGasPrice,
      });

      const txReceipt = await tx.wait();
      const exactInputEvent =
        await this.extendedEthersService.getEventFromReceipt(
          txReceipt,
          'ExactInput',
        );

      const [, , , , amountOut] = exactInputEvent.args;

      const logObject = await this.databaseService.createSwapV3LogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        tokenIn as string,
        tokenOut as string,
        encodedBestPath,
        amountIn as bigint,
        amountOut,
      );

      await this.databaseService.logSwapV3Tx(logObject);

      return exactInputEvent.args;
    } catch (error) {
      this.logger.error(
        'Error while exactInput function in swap-v3.service.ts: ',
        error,
      );
      throw error;
    }
  }

  async findBestPath(
    from: AddressLike,
    to: AddressLike,
    amountIn: BigNumberish,
  ): Promise<string> {
    const { data } = await firstValueFrom(
      this.httpService
        .get('https://devapi.wemix.fi/weswapV3/swapPath', {
          params: {
            from,
            to,
            amountIn,
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'Error on findBestPath() through API';
          }),
        ),
    );

    console.log('Data from API : ' + JSON.stringify(data));
    const bestPath = data.data.bestPath;
    const pathVersion = data.data.version;
    console.log('Version from API : ' + pathVersion);
    console.log('Best Path from API : ' + bestPath);

    let encodedPath = '';

    // const bestV3PathInBytes = await ethers.solidityPacked(['address', 'uint24', 'address'], [token0, fee, token1]);
    // Branching logic based on path version
    if (pathVersion === 'V2') {
      // V2 path encoding: Just token addresses
      throw new Error('path V2 should not use Swap V3');
    } else if (pathVersion === 'V3') {
      console.log('Path = V3');
      // V3 path encoding: Token addresses interleaved with fees
      const types = [];
      const values = [];

      for (let i = 0; i < bestPath.length; i++) {
        if (i % 2 === 0) {
          // Token address
          types.push('address');
          values.push(bestPath[i]);
        } else {
          // Fee
          types.push('uint24');
          values.push(bestPath[i]);
        }
      }

      encodedPath = ethers.solidityPacked(types, values);
    } else {
      throw new Error('Unsupported path version');
    }

    // console.log(`Encoded path1 length: ${encodedPath.length}`);
    // encodedPath = ethers.solidityPacked(['address', 'address'], [from,to]);

    // encodedPath = ethers.solidityPacked(['address', 'uint24', 'address'], [from, ]);
    console.log(`Encoded path2 length: ${encodedPath.length}`);
    console.log(encodedPath);
    return encodedPath;
  }
}
