import { Injectable, Logger } from '@nestjs/common';
import { BigNumberish, AddressLike, ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';
import { ExtendedEthersService } from 'src/extended-ethers/extended-ethers.service';

import * as NCPStakingJson from '../../wemixfi_env/NCPStaking.json';
import { NCPStaking } from '../../types/ethers/NCPStaking';

import { CA } from 'wemixfi_env/contractInfo_testnet'; // CA: Contract Address

const contractName: string = 'NCPStaking'; // Contract for 'Wonder Staking'

@Injectable()
export class WonderStakingService {
  private readonly wWemixAddress = CA.wWemix;

  private readonly NCPStakingAddress = CA.ncp_staking;

  private NCPStakingContract: NCPStaking;

  private readonly NCPStakingContractABI = NCPStakingJson.abi;

  constructor(
    private databaseService: DatabaseService,
    private accountService: AccountService,
    private extendedEthersService: ExtendedEthersService,
  ) {
    const provider = this.databaseService.provider();

    this.NCPStakingContract = new ethers.Contract(
      this.NCPStakingAddress,
      this.NCPStakingContractABI,
      provider,
    ) as unknown as NCPStaking;
  }

  private readonly logger = new Logger(WonderStakingService.name);

  // Kakao Games Wonder Pid : 21

  async getPlatformFeeRatio() {
    try {
        const feeRatio = await this.NCPStakingContract.getPlatformFeeRatio();
        console.log(feeRatio)
        return feeRatio;
    } catch (error) {
        console.log(error);
    }
  }

  // Deposit
  async deposit(
    _msgSender:AddressLike,
    _pid:BigNumberish,
    _amount:BigNumberish,
    _to:AddressLike,
    _claimReward:boolean,
    _comp:boolean
  ) {
    // Processing data for DB Logging
    const funcName = 'deposit';
    let value: bigint = 0n// Since staking is only allowed with 'Native Token'
    const inputJson = JSON.stringify({
        _msgSender,
        _pid,
        _amount,
        _to,
        _claimReward,
        _comp
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(_msgSender);
    const NCPStakingWithSigner = this.NCPStakingContract.connect(senderWallet);
 
    _amount = ethers.parseEther(_amount.toString())
    console.timeLog("_amount converted in wei " + _amount)
    value = _amount as bigint;

    try {
        const tx = await NCPStakingWithSigner.deposit(_pid,_amount,_to,_claimReward,_comp, { value });
        const txReceipt = await tx.wait();

        const decodedLogs = await this.extendedEthersService.decodeReceiptLogs(txReceipt);

        const depositEvents = decodedLogs.filter((log) => log.name === 'Deposit');
        for (const depositEvent of depositEvents) {
          console.log(depositEvent);
        }

        const {user,pid,amount,rewardAmount} = depositEvents[0].args;

        const toPid = pid; // Since the process 'deposit' function doesn't change the 'pid'

        const logObject = await this.databaseService.createWonderStakingLogObject(
          txReceipt,
          contractName,
          funcName,
          input,
          value,
          pid,
          toPid,
          user,
          amount,
          rewardAmount
        );
  
        await this.databaseService.logWonderStakingTx(logObject);

        return depositEvents[0].args;

    } catch (error) {
        console.log(error);
    }
  }

  async withdrawRequest(
    _msgSender: AddressLike,
    _pid: number,
    _toPid: number,
    _amount: BigNumberish,
    _to: AddressLike,
    _claimReward: boolean,
    _comp: boolean
  ) {
    // Processing data for DB Logging
    const funcName = 'withdrawRequest';
    let value: bigint = 0n; // Since staking is only allowed with 'Native Token'
    const inputJson = JSON.stringify({
      msgSender: _msgSender,
      pid: _pid,
      toPid: _toPid,
      amount: _amount,
      to: _to,
      claimReward: _claimReward,
      comp: _comp
    });
    const input: string = JSON.stringify(inputJson);
    ///

    const senderWallet = await this.accountService.getAddressWallet(_msgSender);
    const NCPStakingWithSigner = this.NCPStakingContract.connect(senderWallet);

    let amountInWei = ethers.parseEther(_amount.toString());
    console.log("Amount converted in wei: " + amountInWei);

    try {
      const tx = await NCPStakingWithSigner.withdrawRequest(_pid, _toPid, amountInWei, _to, _claimReward, _comp);
      const txReceipt = await tx.wait();

      const decodedLogs = await this.extendedEthersService.decodeReceiptLogs(txReceipt);
      console.log(decodedLogs);

      const withdrawEvents = decodedLogs.filter((log) => log !== null && log.name === 'WithdrawRequest');

      if (withdrawEvents.length === 0) {
        throw new Error("No 'WithdrawRequest' events found in the transaction logs.");
      }

      const mintEvents = decodedLogs.filter((log) => log !== null && log.name === 'Mint');
      console.log(mintEvents[0]);

      if (mintEvents.length === 0) {
        throw new Error("No 'Mint' events found in the transaction logs.");
      }

      const {pid,amount,to,rewardAmount} = withdrawEvents[0].args;

      const logObject = await this.databaseService.createWonderStakingLogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value, // ~TxInfo
        pid,
        _toPid,
        to,
        amount,
        rewardAmount // ~WonderStakingTx
      );

      await this.databaseService.logWonderStakingTx(logObject);

      const resultJson = {
        WithdrawEvent: withdrawEvents[0].args,
        tokenId: mintEvents[0].args.tokenId
      };
      return resultJson;
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred during the withdrawal request operation');
    }
  }
  
  async withdraw(
    _msgSender: AddressLike,
    _pid: BigNumberish,
    _tokenId: BigNumberish,
    _to: AddressLike
  ) {
    const funcName = 'withdraw';
    let value: bigint = 0n;  // Since staking is only allowed with 'Native Token'
    const inputJson = JSON.stringify({
      msgSender: _msgSender,
      pid: _pid,
      tokenId: _tokenId,
      to: _to,
    });
    const input: string = JSON.stringify(inputJson);
    const senderWallet = await this.accountService.getAddressWallet(_msgSender);
    const NCPStakingWithSigner = this.NCPStakingContract.connect(senderWallet);

    try {
      const tx = await NCPStakingWithSigner.withdraw(_pid, _tokenId, _to);
      const txReceipt = await tx.wait();

      const decodedLogs = await this.extendedEthersService.decodeReceiptLogs(txReceipt);
      console.log(decodedLogs);

      const events = decodedLogs.filter((log) => log !== null && log.name === 'Withdraw');
      for (const event of events) {
        console.log(event);
      }

      if (events.length === 0) {
        throw new Error("No 'Withdraw' events found in the transaction logs.");
      }

      const {pid,amount,to,rewardAmount} = events[0].args;

      const toPid = pid;

      const logObject = await this.databaseService.createWonderStakingLogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value, // ~TxInfo
        pid,
        toPid,
        to,
        amount,
        rewardAmount // ~WonderStakingTx
      );

      await this.databaseService.logWonderStakingTx(logObject);

      return events[0].args;
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred during the withdrawal operation');
    }
  }

async changeNCP(
  _msgSender: AddressLike,
  _pid: number,
  _toPid: number,
  _tokenId: number,
  _to: AddressLike,
  _claimReward: boolean,
  _cancel: boolean
) {
  const funcName = 'changeNCP';
  let value: bigint = 0n;  // Since staking is only allowed with 'Native Token'
  const inputJson = JSON.stringify({
    msgSender: _msgSender,
    pid: _pid,
    toPid: _toPid,
    tokenId: _tokenId,
    to: _to,
    claimReward: _claimReward,
    cancel: _cancel
  });
  const input: string = JSON.stringify(inputJson);
  const senderWallet = await this.accountService.getAddressWallet(_msgSender);
  const NCPStakingWithSigner = this.NCPStakingContract.connect(senderWallet);

  try {
    const tx = await NCPStakingWithSigner.changeNCP(_pid, _toPid, _tokenId, _to, _claimReward, _cancel);
    const txReceipt = await tx.wait();

    const decodedLogs = await this.extendedEthersService.decodeReceiptLogs(txReceipt);
    console.log(decodedLogs);

    const events = decodedLogs.filter((log) => log !== null && log.name === 'Withdraw');
    for (const event of events) {
      console.log(event);
    }

    if (events.length === 0) {
      throw new Error("No 'Withdraw' events found in the transaction logs.");
    }

    const {pid,amount,to,rewardAmount} = events[0].args;

    const logObject = await this.databaseService.createWonderStakingLogObject(
      txReceipt,
      contractName,
      funcName,
      input,
      value, // ~TxInfo
      pid,
      _toPid,
      to,
      amount,
      rewardAmount // ~WonderStakingTx
    );

    await this.databaseService.logWonderStakingTx(logObject);

    return events[0].args;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred during the NCP change operation');
  }
}

async withdrawAll(
  _msgSender: AddressLike,
  _to: AddressLike
) {
  const funcName = 'withdrawAll';
  let value: bigint = 0n;  // Since staking is only allowed with 'Native Token'
  const inputJson = JSON.stringify({
    msgSender: _msgSender,
    to: _to,
  });
  const input: string = JSON.stringify(inputJson);
  const senderWallet = await this.accountService.getAddressWallet(_msgSender);
  const NCPStakingWithSigner = this.NCPStakingContract.connect(senderWallet);

  try {
    const tx = await NCPStakingWithSigner.withdrawAll(_to);
    const txReceipt = await tx.wait();

    // const decodedLogs = await this.extendedEthersService.decodeReceiptLogs(txReceipt);
    // console.log(decodedLogs);

    // const events = decodedLogs.filter((log) => log !== null && log.name === 'Withdraw');

    // for (const event of events) {
    //   console.log(event);
    // }

    // if (events.length === 0) {
    //   throw new Error("No 'Withdraw' events found in the transaction logs.");
    // }

        // const {pid,amount,to,rewardAmount} = events[0].args;

    const withdrawEvent = await this.extendedEthersService.catchEventFromReceipt(txReceipt,'Withdraw')

    const {pid,amount,to,rewardAmount} = withdrawEvent.args;


    const toPid = pid;

    const logObject = await this.databaseService.createWonderStakingLogObject(
      txReceipt,
      contractName,
      funcName,
      input,
      value, // ~TxInfo
      pid,
      toPid,
      to,
      amount,
      rewardAmount // ~WonderStakingTx
    );

    await this.databaseService.logWonderStakingTx(logObject);

    return withdrawEvent.args;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred during the withdraw all operation');
  }
}

async withdrawAllWithPid(
  _msgSender: AddressLike,
  _pid: BigNumberish,
  _to: AddressLike
) {
  const funcName = 'withdrawAllWithPid';
  let value: bigint = 0n;  // Since staking is only allowed with 'Native Token'
  const inputJson = JSON.stringify({
    msgSender: _msgSender,
    pid: _pid,
    to: _to,
  });
  const input: string = JSON.stringify(inputJson);
  const senderWallet = await this.accountService.getAddressWallet(_msgSender);
  const NCPStakingWithSigner = this.NCPStakingContract.connect(senderWallet);

  try {
    const tx = await NCPStakingWithSigner.withdrawAllWithPid(_pid, _to);
    const txReceipt = await tx.wait();

    const decodedLogs = await this.extendedEthersService.decodeReceiptLogs(txReceipt);
    console.log(decodedLogs);

    const events = decodedLogs.filter((log) => log !== null && log.name === 'Withdraw');
    for (const event of events) {
      console.log(event);
    }

    if (events.length === 0) {
      throw new Error("No 'Withdraw' events found in the transaction logs.");
    }

    const {pid,amount,to,rewardAmount} = events[0].args;

    const toPid = pid;

    const logObject = await this.databaseService.createWonderStakingLogObject(
      txReceipt,
      contractName,
      funcName,
      input,
      value, // ~TxInfo
      pid,
      toPid,
      to,
      amount,
      rewardAmount // ~WonderStakingTx
    );

    await this.databaseService.logWonderStakingTx(logObject);

    return events[0].args;
  } catch (error) {
    console.error(error);
    throw new Error('An error occurred during the withdraw all with pid operation');
  }
}

  // Reward related
  async claim(
    _msgSender: AddressLike,
    _pid: BigNumberish,
    _to: AddressLike,
  ) {
    const funcName = 'claim';
    let value: bigint = 0n; // Since staking is only allowed with 'Native Token'
    const inputJson = JSON.stringify({
      msgSender: _msgSender,
      pid: _pid,
      to: _to,
    });
    const input: string = JSON.stringify(inputJson);
  
    const senderWallet = await this.accountService.getAddressWallet(_msgSender);
    const NCPStakingWithSigner = this.NCPStakingContract.connect(senderWallet);
  
    try {
      const tx = await NCPStakingWithSigner.claim(_pid, _to);
      const txReceipt = await tx.wait();
  
      const decodedLogs = await this.extendedEthersService.decodeReceiptLogs(txReceipt);
      console.log(decodedLogs);
  
      const harvestEvents = decodedLogs.filter((log) => log !== null && log.name === 'Harvest');
  
      if (harvestEvents.length === 0) {
        throw new Error("No 'Harvest' events found in the transaction logs.");
      }
  
      const {pid,amount} = harvestEvents[0].args;

      const amountSent = 0n; // 'claim' is for claiming the rewards
      const rewardAmount = amount // 'amount' from event 'Harvest' means the amount of the reward
      const toPid = pid;
  
      const logObject = await this.databaseService.createWonderStakingLogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value, // ~TxInfo
        pid,
        toPid,
        _to as string,
        amountSent,
        rewardAmount // ~WonderStakingTx
      );
  
      await this.databaseService.logWonderStakingTx(logObject);
      return harvestEvents[0].args;
  
    } catch (error) {
      console.log(error);
      throw new Error('An error occurred during the claim operation');
    }
  }
  
  
  async compound(
    _msgSender: AddressLike,
    _pid: BigNumberish,
    _to: AddressLike,
  ) {
    const funcName = 'compound';
    let value: bigint = 0n; // Since staking is only allowed with 'Native Token'
    const inputJson = JSON.stringify({
      msgSender: _msgSender,
      pid: _pid,
      to: _to,
    });
    const input: string = JSON.stringify(inputJson);
  
    const senderWallet = await this.accountService.getAddressWallet(_msgSender);
    const NCPStakingWithSigner = this.NCPStakingContract.connect(senderWallet);
  
    try {
      const tx = await NCPStakingWithSigner.compound(_pid, _to);
      const txReceipt = await tx.wait();
  
      const decodedLogs = await this.extendedEthersService.decodeReceiptLogs(txReceipt);
  
      const depositEvents = decodedLogs.filter((log) => log && log.name === 'Deposit');
      for (const compoundEvent of depositEvents) {
        console.log(compoundEvent);
      }
  
      if (depositEvents.length === 0) {
        throw new Error("No 'Deposit' events found in the transaction logs.");
      }

      const {user,pid,amount,to,rewardAmount} = depositEvents[0].args;

      const toPid = pid; // Since the process 'deposit' function doesn't change the 'pid'

      const logObject = await this.databaseService.createWonderStakingLogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        pid,
        toPid,
        to, // receiverAddress
        amount,
        rewardAmount
      );

      await this.databaseService.logWonderStakingTx(logObject);
  
      return depositEvents.length > 0 ? depositEvents[0].args : null;
  
    } catch (error) {
      console.log(error);
      throw new Error('An error occurred during the compound operation');
    }
  }
  
  
}
