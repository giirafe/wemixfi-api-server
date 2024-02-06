import { Injectable, Logger } from '@nestjs/common';
import { BigNumberish, AddressLike, ethers } from 'ethers';
import { DatabaseService } from '../database/database.service';
import { AccountService } from 'src/account/account.service';
import { ExtendedEthersService } from 'src/extended-ethers/extended-ethers.service';

import * as StWEMIXV2Json from '../../wemixfi_env/StWEMIXV2.json';
import { StWEMIX } from '../../types/ethers/StWEMIX';

import { CA } from 'wemixfi_env/contractInfo_testnet'; // CA: Contract Address

const contractName: string = 'StWEMIX'; // Contract for 'Wonder Staking'
@Injectable()
export class LiquidStakingService {
  // private readonly wWemixAddress = CA.wWemix;

  private readonly StWEMIXAddress = CA.stWemix;

  private StWEMIXContract: StWEMIX;

  private readonly StWEMIXContractABI = StWEMIXV2Json.abi;

  constructor(
    private databaseService: DatabaseService,
    private accountService: AccountService,
    private extendedEthersService: ExtendedEthersService,
  ) {
    const provider = this.databaseService.provider();

    this.StWEMIXContract = new ethers.Contract(
      this.StWEMIXAddress,
      this.StWEMIXContractABI,
      provider,
    ) as unknown as StWEMIX;
  }

  private readonly logger = new Logger(LiquidStakingService.name);

  // View functions
  async getTotalPooledWEMIXWithFee() {
    try {
      const totalWEMIX =
        await this.StWEMIXContract.getTotalPooledWEMIXWithFee();
      console.log(totalWEMIX);
      return totalWEMIX;
    } catch (error) {
      console.log(error);
    }
  }

  async rewardOf(_msgSender: AddressLike) {
    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(_msgSender);
    const StWEMIXWithSigner = this.StWEMIXContract.connect(senderWallet);

    try {
      const userReward = await StWEMIXWithSigner.rewardOf(_msgSender);
      return userReward;
    } catch (error) {
      console.log(error);
    }
  }
  // Interaction functions
  async deposit(_msgSender: AddressLike, _amount: BigNumberish) {
    // Processing data for DB Logging
    const funcName = 'deposit';
    let value: bigint = 0n; // Since staking is only allowed with 'Native Token'
    const inputJson = JSON.stringify({
      _msgSender,
      _amount,
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(_msgSender);
    const StWEMIXWithSigner = this.StWEMIXContract.connect(senderWallet);

    // convert _amount in to 'wei' and allocate the value in 'value'
    _amount = ethers.parseEther(_amount.toString());
    value = _amount as bigint;

    try {
      const tx = await StWEMIXWithSigner.deposit({ value });
      const txReceipt = await tx.wait();

      const depositEvent = await this.extendedEthersService.catchEventFromReceipt(txReceipt,'Deposited')
      const { wemixAmount, stWemixAmount } = depositEvent.args

      const logObject = await this.databaseService.createLiquidStakingLogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        wemixAmount,
        stWemixAmount,
      );

      await this.databaseService.logLiquidStakingTx(logObject);

      return depositEvent.args;
    } catch (error) {
      console.log(error);
    }
  }

  async withdraw(_msgSender: AddressLike, _amount: BigNumberish) {
    // Processing data for DB Logging
    const funcName = 'withdraw';
    const value: bigint = 0n; // Since staking is only allowed with 'Native Token'
    const inputJson = JSON.stringify({
      _msgSender,
      _amount,
    });
    const input: string = JSON.stringify(inputJson);
    ///

    // login과 유사
    const senderWallet = await this.accountService.getAddressWallet(_msgSender);
    const StWEMIXWithSigner = this.StWEMIXContract.connect(senderWallet);

    // _amount = ethers.parseEther(_amount.toString())
    let amountInWei = await this.extendedEthersService.convertToWei(
      this.StWEMIXAddress,
      _amount,
    );
    // value = _amount as bigint;

    amountInWei = 0n;
    try {
      // await this.extendedEthersService.approveToken(
      //     this.StWEMIXAddress,
      //     senderWallet,
      //     amountInWei,
      //     this.StWEMIXAddress,
      // );

      const tx = await StWEMIXWithSigner.withdraw(amountInWei);
      const txReceipt = await tx.wait();

      const withdrawEvent = await this.extendedEthersService.catchEventFromReceipt(txReceipt,'Withdrew')

      const { wemixAmount, stWemixAmount } = withdrawEvent.args;

      const logObject = await this.databaseService.createLiquidStakingLogObject(
        txReceipt,
        contractName,
        funcName,
        input,
        value,
        wemixAmount,
        stWemixAmount,
      );

      await this.databaseService.logLiquidStakingTx(logObject);

      return withdrawEvent.args;
    } catch (error) {
      console.log(error);
    }
  }
}
