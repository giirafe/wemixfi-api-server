import { Injectable,Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Account, TransferTx, TxInfo, LendAndBorrowTx, PoolTx, SwapV2Tx } from './database.model';

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
        @InjectModel(LendAndBorrowTx) 
        private readonly LendAndBorrowTxModel: typeof LendAndBorrowTx,
        @InjectModel(PoolTx) 
        private readonly PoolTxModel: typeof PoolTx,
        @InjectModel(SwapV2Tx) 
        private readonly SwapV2TxModel: typeof SwapV2Tx,
    ) {}

    public provider(): ethers.JsonRpcProvider {
        const wemixTestnetProvider = new ethers.JsonRpcProvider('https://api.test.wemix.com/')
        return wemixTestnetProvider;
    }

    private readonly logger = new Logger(DatabaseService.name);

    // Set and Get Blockchain Wallet Account Info
    async setAccount(accountAddress: string, privateKey: string): Promise<Account> {
        // Check if the accountAddress already exists in the database
        const existingAccount = await this.accountModel.findOne({ where: { accountAddress } });
        
        if (existingAccount) {
            // If account exists, throw an error
            throw new Error('Database Service : Account already exists');
        }

        // If account does not exist, create a new account
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
    
    async getAccountPrivateKey(accountAddress: string): Promise<string | null> {
        const account = await this.accountModel.findOne({ where: { accountAddress } });
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
        data: string
    ): Promise<TransferTx> {
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

    // Storing L&B Tx in DB
    async logLendAndBorrowTx(
        block_number: number, 
        block_timestamp: string, 
        tx_hash: string, 
        name: string, 
        func_name: string, 
        func_sig: string, 
        from: string, 
        to: string, 
        input: string, 
        value: bigint,
        assetAddress:string,
        assetAmount:bigint,
    ): Promise<LendAndBorrowTx> {
        this.logger.debug('LendAndBorrowTx Logged in Database Service');
        const newTxInfo = await this.LendAndBorrowTxModel.create( {
            block_number,
            block_timestamp,
            tx_hash,
            name,
            func_name,
            func_sig,
            from,
            to,
            input,
            value,
            assetAddress,
            assetAmount
        } as any );
        return newTxInfo;
    }

    async logPoolTx(
        block_number: number, 
        block_timestamp: string, 
        tx_hash: string, 
        name: string, 
        func_name: string, 
        func_sig: string, 
        from: string, 
        to: string, 
        input: string, 
        value: bigint
    ): Promise<TxInfo> {
        this.logger.debug('PoolTx Logged in Database Service');
        const newTxInfo = await this.PoolTxModel.create({
            block_number,
            block_timestamp,
            tx_hash,
            name,
            func_name,
            func_sig,
            from,
            to,
            input,
            value
        });
        return newTxInfo;
    }

    // Storing L&B Tx in DB
    async logSwapV2Tx(
        block_number: number, 
        block_timestamp: string, 
        tx_hash: string, 
        name: string, 
        func_name: string, 
        func_sig: string, 
        from: string, 
        to: string, 
        input: string, 
        value: bigint
    ): Promise<TxInfo> {
        this.logger.debug('SwapV2Tx Logged in Database Service');
        const newTxInfo = await this.SwapV2TxModel.create({
            block_number,
            block_timestamp,
            tx_hash,
            name,
            func_name,
            func_sig,
            from,
            to,
            input,
            value
        });
        return newTxInfo;
    }

}