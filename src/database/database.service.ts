import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import {
  Account,
  TransferTx,
  TxInfo,
  LendAndBorrowTx,
  PoolTx,
  SwapV2Tx,
} from './database.model';

// import ethers package
import { ethers } from 'ethers';
import { HttpService } from '@nestjs/axios';

interface ReceiptData {
  blockNumber: number;
  blockTimestamp: string;
  txHash: string;
  funcSig: string;
  from: string;
  to: string;
}

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(Account)
    private readonly accountModel: typeof Account,
    @InjectModel(TransferTx)
    private readonly transferTxModel: typeof TransferTx,
    @InjectModel(LendAndBorrowTx)
    private readonly LendAndBorrowTxModel: typeof LendAndBorrowTx,
    @InjectModel(PoolTx)
    private readonly PoolTxModel: typeof PoolTx,
    @InjectModel(SwapV2Tx)
    private readonly SwapV2TxModel: typeof SwapV2Tx,
  ) {}

  public provider(): ethers.JsonRpcProvider {
    const wemixTestnetProvider = new ethers.JsonRpcProvider(
      'https://api.test.wemix.com/',
    );
    return wemixTestnetProvider;
  }

  private readonly logger = new Logger(DatabaseService.name);

  // Set and Get Blockchain Wallet Account Info
  async setAccount(
    accountAddress: string,
    privateKey: string,
  ): Promise<Account> {
    // Check if the accountAddress already exists in the database
    const existingAccount = await this.accountModel.findOne({
      where: { accountAddress },
    });

    if (existingAccount) {
      // If account exists, throw an error
      throw new Error('Database Service : Account already exists');
    }

    // If account does not exist, create a new account
    const newAccount = await this.accountModel.create({
      accountAddress,
      privateKey,
    });
    return newAccount;
  }

  async getAccountAll(): Promise<Account[]> {
    this.logger.debug('Get All Account Called');
    return this.accountModel.findAll();
  }

  async getAccount(accountAddress: string): Promise<Account | null> {
    return this.accountModel.findOne({ where: { accountAddress } });
  }

  async getAccountById(id: string): Promise<Account | null> {
    return this.accountModel.findByPk(id);
  }

  async getAccountPrivateKey(accountAddress: string): Promise<string | null> {
    const account = await this.accountModel.findOne({
      where: { accountAddress },
    });
    return account ? account.privateKey : null;
  }

  async delete(id: string): Promise<void> {
    await this.accountModel.destroy({ where: { id } });
  }

  // Service related 'ethers' package
  async getBalance(address: string): Promise<number> {
    // this.logger.debug("getBalance on test-route service"); // Logging using Nestjs logger
    const provider = this.provider();
    const balance = await provider.getBalance(address);
    return Number(balance);
  }

  // Function storing Wemix Transfer Data in DB
  async logWemixTransfer(
    senderAddress: string,
    receiverAddress: string,
    amount: number,
    contractAddress: string,
    data: string,
  ): Promise<TransferTx> {
    this.logger.debug('Tx Logged');
    const newTransferTx = await this.transferTxModel.create({
      senderAddress,
      receiverAddress,
      amount,
      contractAddress,
      data,
    });
    return newTransferTx;
  }

  // Method to fetch all transaction logs
  async getAllTransactionLogs(): Promise<TransferTx[]> {
    this.logger.debug('Get All Tx Called');
    return await this.transferTxModel.findAll();
  }

  // Creating Object for Lend & Borrow Table
  async createLBLogObject(
    txReceipt: any, // Type this according to the structure of extractedData
    contractName: string,
    funcName: string,
    input: string,
    value: bigint,
    assetAddress: string,
    amountInWei: bigint,
  ): Promise<any> {
    const extractedData = await this.extractTxDataFromReceipt(txReceipt);

    return {
      block_number: extractedData.blockNumber,
      block_timestamp: extractedData.blockTimestamp,
      tx_hash: extractedData.txHash,
      name: contractName,
      func_name: funcName,
      func_sig: extractedData.funcSig,
      from: extractedData.from,
      to: extractedData.to,
      input: input,
      value: value,
      assetAddress: assetAddress,
      assetAmount: amountInWei,
    };
  }

  async createPoolLogObject(
    txReceipt: any, // Type this according to the structure of extractedData
    contractName: string,
    funcName: string,
    input: string,
    value: bigint,
    assetAAddress: string,
    assetAAmount: bigint,
    assetBAddress: string,
    assetBAmount: bigint,
    liquidityAdded: bigint,
    liquidityRemoved: bigint,
  ): Promise<any> {
    const extractedData = await this.extractTxDataFromReceipt(txReceipt);
    // console.log('name in createPoolLogObject : '+ contractName)
    return {
      block_number: extractedData.blockNumber,
      block_timestamp: extractedData.blockTimestamp,
      tx_hash: extractedData.txHash,
      name: contractName,
      func_name: funcName,
      func_sig: extractedData.funcSig,
      from: extractedData.from,
      to: extractedData.to,
      input: input,
      value: value,
      assetAAddress: assetAAddress,
      assetAAmount: assetAAmount,
      assetBAddress: assetBAddress,
      assetBAmount: assetBAmount,
      liquidityAdded: liquidityAdded,
      liquidityRemoved: liquidityRemoved,
    };
  }

  async createSwapV2LogObject(
    txReceipt: any, // Type this according to the structure of extractedData
    contractName: string,
    funcName: string,
    input: string,
    value: bigint,
    swapInAddress: string,
    swapInAmount: bigint,
    swapOutAddress: string,
    swapOutAmount: bigint,
  ): Promise<any> {
    const extractedData = await this.extractTxDataFromReceipt(txReceipt);
    console.log('name in createSwapV2LogObject : '+ contractName)
    return {
      block_number: extractedData.blockNumber,
      block_timestamp: extractedData.blockTimestamp,
      tx_hash: extractedData.txHash,
      name: contractName,
      func_name: funcName,
      func_sig: extractedData.funcSig,
      from: extractedData.from,
      to: extractedData.to,
      input: input,
      value: value,
      swapInAddress: swapInAddress,
      swapInAmount: swapInAmount,
      swapOutAddress: swapOutAddress,
      swapOutAmount: swapOutAmount,
    };
  }

  // Storing L&B Tx in DB
  async logLendAndBorrowTx(
    block_number: number,
    block_timestamp: string,
    tx_hash: string,
    contract_name: string,
    func_name: string,
    func_sig: string,
    from: string,
    to: string,
    input: string,
    value: bigint,
    assetAddress: string,
    assetAmount: bigint,
  ): Promise<LendAndBorrowTx> {
    this.logger.debug(
      'Attempt to log in LendandBorrowTx table : Database Service',
    );
    console.log("assetAddress & assetAmount from databaseService : " + assetAddress + "   " + assetAmount)
    const newTxInfo = await this.LendAndBorrowTxModel.create({
      block_number,
      block_timestamp,
      tx_hash,
      contract_name,
      func_name,
      func_sig,
      from,
      to,
      input,
      value,
      assetAddress,
      assetAmount,
    } as unknown as LendAndBorrowTx);
    return newTxInfo;
  }

  async logPoolTx(
    block_number: number,
    block_timestamp: string,
    tx_hash: string,
    contract_name: string,
    func_name: string,
    func_sig: string,
    from: string,
    to: string,
    input: string,
    value: bigint,
    assetAAddress: string,
    assetAAmount: bigint,
    assetBAddress: string,
    assetBAmount: bigint,
    liquidityAdded: bigint,
    liquidityRemoved: bigint,
  ): Promise<TxInfo> {
    this.logger.debug('Attempt to log in PoolTx table : Database Service');
    // console.log('contract_name in logPoolTx : '+ contract_name)
    const newTxInfo = await this.PoolTxModel.create({
      block_number,
      block_timestamp,
      tx_hash,
      contract_name,
      func_name,
      func_sig,
      from,
      to,
      input,
      value,
      assetAAddress,
      assetAAmount,
      assetBAddress,
      assetBAmount,
      liquidityAdded,
      liquidityRemoved,
    } as any); // as unknown as PoolTx 로 하면 type 설정이 정상적으로 되긴함
    return newTxInfo;
  }

  async logSwapV2Tx(
    block_number: number,
    block_timestamp: string,
    tx_hash: string,
    contract_name: string,
    func_name: string,
    func_sig: string,
    from: string,
    to: string,
    input: string,
    value: bigint,
    swapInAddress: string,
    swapInAmount: bigint,
    swapOutAddress: string,
    swapOutAmount: bigint,
  ): Promise<TxInfo> {
    this.logger.debug('Attempt to log in SwapV2Tx table : Database Service');
    console.log('contract_name in logSwapV2Tx : '+ contract_name)
    const newTxInfo = await this.SwapV2TxModel.create({
      block_number,
      block_timestamp,
      tx_hash,
      contract_name,
      func_name,
      func_sig,
      from,
      to,
      input,
      value,
      swapInAddress,
      swapInAmount,
      swapOutAddress,
      swapOutAmount,
    } as any);
    return newTxInfo;
  }

  // Internal Function
  async extractTxDataFromReceipt(
    txReceipt: ethers.TransactionReceipt,
  ): Promise<ReceiptData> {
    // Extract basic data from receipt
    const blockNumber = txReceipt.blockNumber;
    const txHash = txReceipt.hash;
    const from = txReceipt.from;
    const to = txReceipt.to;
    const funcSig = txHash.slice(0, 10);

    // Get block details to extract the timestamp
    const block = await this.provider().getBlock(blockNumber);
    const blockTimestamp = new Date(block.timestamp * 1000).toISOString(); // Convert timestamp to ISOString

    // Return the extracted data
    return {
      blockNumber,
      blockTimestamp,
      txHash,
      funcSig,
      from,
      to,
    };
  }
}
