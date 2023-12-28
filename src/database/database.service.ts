import { Injectable,Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account, TransferTx } from './database.model';

// import ethers package
import { ethers } from 'ethers';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class DatabaseService {
    constructor(
    @InjectModel(Account) 
    private readonly accountModel: typeof Account,
    @InjectModel(TransferTx) 
    private readonly transferTxModel: typeof TransferTx,
    ) {}

    private provider(): ethers.JsonRpcProvider {
        // const INFURA_API_KEY = '2fcb5117fa174f02965947ffbef7f0ca';
        // const ethereumProvider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/' + INFURA_API_KEY);
        const wemixTestnetProvider = new ethers.JsonRpcProvider('https://api.test.wemix.com/')
        return wemixTestnetProvider;
    }

    private readonly logger = new Logger(DatabaseService.name);

    // Set and Get Blockchain Wallet Account Info
    async setAccount(accountAddress: string, privateKey: string): Promise<Account> {
        const newAccount = await this.accountModel.create({ accountAddress, privateKey });
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

    // Implementing Wemix Transfer service
    // WIP : Currently accepting senderPrivateKey as a input and using it directly to send Tx which is not a secured process. Thus I will accept senderPrivateKey -> senderAddress, and by sending a internal Http request retrieve a server stored senderAddress's private key to use it to send Tx
    async transferWemix(senderAddress: string, receiver: string, amount: number): Promise<ethers.TransactionReceipt> {
        // Getting account's privateKey internally
        const senderAccount = await this.getAccount(senderAddress);

        if (!senderAccount || !senderAccount.privateKey) {
            throw new Error('Sender account not found or private key is missing');
        }
        const senderPrivateKey = senderAccount.privateKey;
        
        const provider = this.provider();
        const wallet = new ethers.Wallet(senderPrivateKey, provider);
        
        // Convert the amount to Wei (the smallest denomination of Ether)
        const amountInWei = ethers.parseEther(amount.toString());
    
        // Create a transaction object
        const tx = {
            to: receiver,
            value: amountInWei,
            // Current 'tx' setting allows ethers.js to set Gas Limit and Gas Price
        };
    
        try {
            // Sign and send the transaction
            const response = await wallet.sendTransaction(tx);
            await this.logTransaction(wallet.address, receiver, amount, '0x00', null); // Dummy values for contractAddress and data
            
            // Wait for the transaction to be mined
            return await response.wait();
        } catch (error) {
            // Handle errors appropriately
            this.logger.error('Error in transferWemix:', error);
            throw error;
        }
    }

    async logTransaction(senderAddress: string, receiverAddress: string, amount: number, contractAddress: string, data: string): Promise<TransferTx> {
        this.logger.debug('Tx Logged');
        const newTransferTx = await this.transferTxModel.create({
            senderAddress,
            receiverAddress,
            amount,
            contractAddress,
            data
        });
        return newTransferTx;
    }

    // Method to fetch all transaction logs
    async getAllTransactionLogs(): Promise<TransferTx[]> {
        this.logger.debug('Get All Tx Called');
        return await this.transferTxModel.findAll();
    }

}