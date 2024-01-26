import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';

import * as ERC20Json from '../../wemixFi_env/ERC20.json';
import { ERC20 } from '../../types/ethers/ERC20';

import * as WWEMIXJson from '../../wemixFi_env/WWEMIX.json';
import * as WeswapPairJson from '../../wemixFi_env/WeswapPair.json';
import * as WemixDollarJson from '../../wemixFi_env/WemixDollar.json';
import * as NonfungiblePositionHelperJson from '../../wemixFi_env/NonfungiblePositionHelper.json';
import * as NonfungiblePositionManagerJson from '../../wemixFi_env/NonfungiblePositionManager.json';
import * as WeswapV3PoolJson from '../../wemixFi_env/WeswapV3Pool.json';

import { contractInfos, CA } from 'wemixFi_env/contractInfo_testnet'; // CA for Contract Address

@Injectable()
export class ExtendedEthersService {
  private readonly ERC20ContractABI = ERC20Json.abi;

  constructor(
    private databaseService: DatabaseService,
    private accountService: AccountService,
  ) {}

  public provider(): ethers.JsonRpcProvider {
    const wemixTestnetProvider = new ethers.JsonRpcProvider(
      'https://api.test.wemix.com/',
    );
    return wemixTestnetProvider;
  }

  private readonly logger = new Logger(ExtendedEthersService.name);

  async approveToken(tokenAddress, senderWallet, amountInWei, routerAddress) {
    try {
      const tokenToApprove: ERC20 = new ethers.Contract(
        tokenAddress,
        this.ERC20ContractABI,
        this.provider(),
      ) as unknown as ERC20;
      const tx = await tokenToApprove
        .connect(senderWallet)
        .approve(routerAddress, amountInWei);
      return await tx.wait();
    } catch {
      throw new Error(`Error : approving ${amountInWei} for ${tokenAddress}`);
    }
  }

  async getDecimal(tokenAddress): Promise<bigint> {
    try {
      const tokenContract: ERC20 = new ethers.Contract(
        tokenAddress,
        this.ERC20ContractABI,
        this.provider(),
      ) as unknown as ERC20;
      const tokenDecimals = await tokenContract.decimals();
      this.logger.debug(`Token Decimals : ${tokenDecimals}`);
      return tokenDecimals;
    } catch {
      throw new Error(`Error : getting decimals of ${tokenAddress} `);
    }
  }

  async convertToWei(tokenAddress, tokenAmount): Promise<bigint> {
    try {
      const tokenDecimal = await this.getDecimal(tokenAddress);
      const amountInWei = ethers.parseUnits(
        tokenAmount.toString(),
        tokenDecimal,
      );
      this.logger.debug(`Amount converted in wei ${amountInWei}`);
      return amountInWei;
    } catch (e) {
      console.error(e)
      throw new Error(`Error : converting amount of ${tokenAddress} `);
    }
  }

  async decodeReceiptLogs(receiptLogs): Promise<any> {
    const decodedLogs = [];

    for (const log of receiptLogs) {
      if (contractInfos[log.address]) {
        const contractName: string = contractInfos[log.address].name;
        const abiName: string = contractInfos[log.address].abi;
        let contractJSON;

        try {
          console.log(
            `Address found: ${log.address}, Contract Name: ${contractName}, ABI Name: ${abiName}`,
          );

          switch (abiName) {
            case 'WWEMIX': {
              contractJSON = WWEMIXJson;
              break;
            }
            case 'WeswapPair': {
              contractJSON = WeswapPairJson;
              break;
            }
            case 'WemixDollar': {
              contractJSON = WemixDollarJson;
              break;
            }
            case 'ERC20': {
              contractJSON = ERC20Json;
              break;
            }
            case 'NonfungiblePositionHelper': {
              contractJSON = NonfungiblePositionHelperJson;
              break;
            }
            case 'NonfungiblePositionManager': {
              contractJSON = NonfungiblePositionManagerJson;
              break;
            }
            case 'WeswapV3Pool': {
              contractJSON = WeswapV3PoolJson;
              break;
            }
            default: {
              throw Error(
                'Need to handle JSON file importation in extended-ethers.service.ts : decodeReceiptLogs()',
              );
            }
          }
          const iface = new ethers.Interface(contractJSON.abi);

          // Decode the log with the interface
          const decodedLog = iface.parseLog({
            topics: log.topics,
            data: log.data,
          });

          decodedLogs.push(decodedLog);
        } catch (error) {
          console.error(
            `Error loading ABI for ${log.address}, ${abiName}: ${error.message}`,
          );
        }
      } else {
        console.log(
          `Address not found in wemixFi_env/contractInfo_testnet.ts : ${log.address}`,
        );
      }
    }
    return decodedLogs;
  }
}
