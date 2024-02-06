import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';

import * as ERC20Json from '../../wemixfi_env/ERC20.json';
import { ERC20 } from '../../types/ethers/ERC20';

import * as CWemixJson from '../../wemixfi_env/CWemix.json'
import * as CWemixDollarJson from '../../wemixfi_env/CWemixDollar.json'
import * as CstWemixJson from '../../wemixfi_env/CstWemix.json'
import * as WWEMIXJson from '../../wemixfi_env/WWEMIX.json';
import * as SwapRouterJson from '../../wemixfi_env/SwapRouter.json';
import * as WeswapPairJson from '../../wemixfi_env/WeswapPair.json';
import * as WemixDollarJson from '../../wemixfi_env/WemixDollar.json';
import * as NonfungiblePositionHelperJson from '../../wemixfi_env/NonfungiblePositionHelper.json';
import * as NonfungiblePositionManagerJson from '../../wemixfi_env/NonfungiblePositionManager.json';
import * as WeswapV3PoolJson from '../../wemixfi_env/WeswapV3Pool.json';
import * as NCPStakingJson from '../../wemixfi_env/NCPStaking.json'
import * as WithdrawalNFTJson from '../../wemixfi_env/WithdrawalNFT.json'
import * as StWEMIXV2Json from '../../wemixfi_env/StWEMIXV2.json';

import { contractInfos, CA } from 'wemixfi_env/contractInfo_testnet'; // CA for Contract Address

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
      console.error(e);
      throw new Error(`Error : converting amount of ${tokenAddress} `);
    }
  }

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

  async catchEventFromReceipt(
    txReceipt:ethers.ContractTransactionReceipt,
    eventName: string,
    returnLast?: boolean, 
  ): Promise<ethers.LogDescription> {
    const decodedLogs:ethers.LogDescription[] = await this.decodeReceiptLogs(txReceipt);
    console.log(decodedLogs);
    
    // Check each log and log its data if it's null
    decodedLogs.forEach((log, index) => {
      if (log === null) {
        console.log(`Log at index ${index} is null`);
      }
    });
    
    // Continue to filter out non-null logs and logs that match the 'Withdraw' event name
    const catchedEvents = decodedLogs.filter((log) => log !== null && log.name === eventName);

    if(catchedEvents.length > 1) {
      // throw new Error(`More than one ${eventName} events found in the Transaction Receipt`)
      if (returnLast) {
        console.log(`\x1b[31mMultiple ${eventName} events found, returning the LAST found\x1b[0m`);
        return catchedEvents[catchedEvents.length - 1];
      } else {
        console.log(`\x1b[31mMultiple ${eventName} events found, returning the FIRST found\x1b[0m`);
        return catchedEvents[0]; 
      }
      return catchedEvents[catchedEvents.length - 1]
    } else if(catchedEvents.length == 0) {
      throw new Error(`No ${eventName} events are found in the Transaction Receipt`)
    } else {
      return catchedEvents[0];
    }
  }

  async decodeReceiptLogs(txReceipt): Promise<ethers.LogDescription[]> {
    const decodedLogs:ethers.LogDescription[] = [];

    for (const log of txReceipt) {
      if (contractInfos[log.address]) {
        const contractName: string = contractInfos[log.address].name;
        const abiName: string = contractInfos[log.address].abi;
        let contractJSON;

        try {
          console.log(
            `Address found: ${log.address}, Contract Name: ${contractName}, ABI Name: ${abiName}`,
          );

          switch (abiName) {
            case 'CWemix': {
              contractJSON = CWemixJson;
              break;
            }
            case 'CWemixDollar': {
              contractJSON = CWemixDollarJson;
              break;
            }
            case 'CstWemix': {
              contractJSON = CstWemixJson;
              break;
            }
            case 'WWEMIX': {
              contractJSON = WWEMIXJson;
              break;
            }
            case 'SwapRouter' : {
              contractJSON = SwapRouterJson;
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
            case 'NCPStaking': {
              contractJSON = NCPStakingJson;
              break;
            }
            case 'WithdrawalNFT': {
              contractJSON = WithdrawalNFTJson;
              break;
            }
            case 'StWEMIXV2' : {
              contractJSON = StWEMIXV2Json;
              break;
            }
            default: {
              throw Error(
                `Error loading ABI for ${log.address}, ${abiName} in extended-ethers.service.ts`,
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
            `${error.message}`,
          );
        }
      } else {
        console.log(
          `\x1b[31m Address not found in wemixFi_env/contractInfo_testnet.ts : ${log.address} \x1b[0m`,
        );
        decodedLogs.push({name:"AddressNotFound"} as ethers.LogDescription)
      }
    }
    return decodedLogs;
  }
}
