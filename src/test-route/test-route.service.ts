import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountDocument } from './test-route.schema';

// import ethers package
import { ethers } from 'ethers';

@Injectable()
export class TestRouteService {
    // By @InjectModel() inject a Mongoose model into this 'ProductService' class / In Model<AccountDocument>, 'Model' is a Generic Type and 'AccountDocument' is a custom class in test-route.schema.ts
    constructor(@InjectModel('TestRouteSchema') private readonly accountModel: Model<AccountDocument>) {}

    private provider(): ethers.JsonRpcProvider {
        // const INFURA_API_KEY = '2fcb5117fa174f02965947ffbef7f0ca';
        // const ethereumProvider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/' + INFURA_API_KEY);
        const wemixTestnetProvider = new ethers.JsonRpcProvider('https://api.test.wemix.com/')
        return wemixTestnetProvider;
    }

    private readonly logger = new Logger(TestRouteService.name);

    // Set and Get Blockchain Wallet Account Info
    async setAccount(accountAddress:string, privateKey:string): Promise<AccountDocument> {
        const newAccount = new this.accountModel({ accountAddress,privateKey});
        return newAccount.save();
    }

    async getAccountAll(): Promise<AccountDocument[]> {
        return this.accountModel.find().exec();
    }

    async getAccount(accountAddress: string): Promise<AccountDocument> {
        return this.accountModel.findOne({ accountAddress }).exec();
    }

    async getAccountById(id:string): Promise<AccountDocument> { // in Mongo 'id' is a string not a number
        return this.accountModel.findById(id).exec();
    }

    async delete(id:string) {
        return this.accountModel.deleteOne({ _id : id }).exec();
    }

    // Service related 'ethers' package
    async getBalance(address: string): Promise<number> {
        // this.logger.debug("getBalance on test-route service"); // Logging using Nestjs logger
        const provider = this.provider();
        const balance = await provider.getBalance(address);
        return Number(balance);
      }

    // Implementing Wemix Transfer service
    async transferWemix(senderPrivateKey: string, receiver: string, amount: number): Promise<ethers.TransactionReceipt> {

        const provider = this.provider();
        const wallet = new ethers.Wallet(senderPrivateKey, provider);
        
        // Convert the amount to Wei (the smallest denomination of Ether)
        const amountInWei = ethers.parseEther(amount.toString());
    
        // Create a transaction object
        const tx = {
            to: receiver,
            value: amountInWei,
            // You might need to set gas limit and gas price, or let ethers.js estimate them
        };
    
        try {
            // Sign and send the transaction
            const response = await wallet.sendTransaction(tx);
    
            // Wait for the transaction to be mined
            return await response.wait();
        } catch (error) {
            // Handle errors appropriately
            this.logger.error('Error in transferWemix:', error);
            throw error;
        }
    }
}
