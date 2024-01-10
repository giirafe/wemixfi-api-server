// account.service.ts
import { Injectable,Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Account, TransferTx } from '../database/database.model';
import { ethers } from 'ethers';

@Injectable()
export class AccountService {
    constructor(
        private databaseService: DatabaseService,
    ) {}
    private readonly logger = new Logger(AccountService.name);

    async setAccount(accountAddress: string, privateKey: string): Promise<Account> {
        this.logger.debug("AccountService : accountAddress, privateKey : " + accountAddress + " " + privateKey)
        return this.databaseService.setAccount(accountAddress, privateKey);
    }

    async getAccount(accountAddress: string): Promise<Account> {
        return this.databaseService.getAccount(accountAddress);
    }

    async getAccountAll(): Promise<Account[]> {
        return this.databaseService.getAccountAll();
    }

    async getAddressWallet(address : string) : Promise<ethers.Wallet> {
        const senderPrivateKey = await this.databaseService.getAccountPrivateKey(address);
        if (!senderPrivateKey) {
            throw new Error('Sender account not found or private key is missing');
        }
        const addressWallet = new ethers.Wallet(senderPrivateKey, this.databaseService.provider());
        return addressWallet;
    }

    async getBalance(address: string): Promise<number> {
        return this.databaseService.getBalance(address);
    }

    // Implementing Wemix Transfer service
    // WIP : Currently accepting senderPrivateKey as a input and using it directly to send Tx which is not a secured process. Thus I will accept senderPrivateKey -> senderAddress, and by sending a internal Http request retrieve a server stored senderAddress's private key to use it to send Tx
    async transferWemix(senderAddress: string, receiverAddress: string, amount: number): Promise<ethers.TransactionReceipt> {

        const senderPrivateKey = await this.databaseService.getAccountPrivateKey(senderAddress);

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
            await this.databaseService.logWemixTransfer(wallet.address, receiverAddress, amount, '0x00', null); // Dummy values for contractAddress and data
            
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
