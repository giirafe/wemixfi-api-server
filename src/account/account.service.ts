// account.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Account, TransferTx } from '../database/database.model';
import { AddressLike, ethers } from 'ethers';

@Injectable()
export class AccountService {
  constructor(private databaseService: DatabaseService) {}
  private readonly logger = new Logger(AccountService.name);

  async setAccount(
    privateKey: string,
  ): Promise<Account> {
    const wallet = new ethers.Wallet(privateKey) 
    const accountAddress = wallet.address;
    this.logger.debug("address found using private key : " + wallet.address)
    const addressToString = accountAddress as string;
    return this.databaseService.setAccount(addressToString, privateKey);
  }

  async getAccount(accountAddress: AddressLike): Promise<Account> {
    const addressToString = accountAddress as string;
    return this.databaseService.getAccount(addressToString);
  }

  async getAccountAll(): Promise<Account[]> {
    return this.databaseService.getAccountAll();
  }

  async getAddressWallet(address: AddressLike): Promise<ethers.Wallet> {
    const addressToString = address as string;
    const senderPrivateKey =
      await this.databaseService.getAccountPrivateKey(addressToString);
    if (!senderPrivateKey) {
      throw new Error('Sender account not found or private key is missing');
    }
    const addressWallet = new ethers.Wallet(
      senderPrivateKey,
      this.databaseService.provider(),
    );
    return addressWallet;
  }

  async getBalance(address: AddressLike): Promise<number> {
    const addressToString = address as string;
    return this.databaseService.getBalance(addressToString);
  }

  // Implementing Wemix Transfer service
  // WIP : Currently accepting senderPrivateKey as a input and using it directly to send Tx which is not a secured process. Thus I will accept senderPrivateKey -> senderAddress, and by sending a internal Http request retrieve a server stored senderAddress's private key to use it to send Tx
  async transferWemix(
    senderAddress: AddressLike,
    receiverAddress: AddressLike,
    amount: number,
  ): Promise<ethers.TransactionReceipt> {
    const senderToString = senderAddress as string;
    const receiverToString = receiverAddress as string;

    const senderPrivateKey =
      await this.databaseService.getAccountPrivateKey(senderToString);

    if (!senderPrivateKey) {
      throw new Error('Sender account not found or private key is missing');
    }

    const provider = this.databaseService.provider();
    const wallet = new ethers.Wallet(senderPrivateKey, provider);

    // Convert the amount to Wei (the smallest denomination of Ether)
    const amountInWei = ethers.parseEther(amount.toString());

    // Create a transaction object
    const tx = {
      to: receiverAddress,
      value: amountInWei,
      // Current 'tx' setting allows ethers.js to set Gas Limit and Gas Price
    };

    try {
      // Sign and send the transaction
      const response = await wallet.sendTransaction(tx);
      await this.databaseService.logWemixTransfer(
        wallet.address,
        receiverToString,
        amount,
        '0x00',
        null,
      ); // Dummy values for contractAddress and data

      // Wait for the transaction to be mined
      return await response.wait();
    } catch (error) {
      // Handle errors appropriately
      this.logger.error('Error in transferWemix:', error);
      throw error;
    }
  }

  async getAllTransactionLogs(): Promise<TransferTx[]> {
    return this.databaseService.getAllTransactionLogs();
  }
}
