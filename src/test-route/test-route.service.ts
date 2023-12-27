import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountDocument } from './test-route.schema';

// import ethers package
import { ethers } from 'ethers';

@Injectable()
export class TestRouteService {
    // By @InjectModel() inject a Mongoose model into this 'ProductService' class / In Model<AccountDocument>, 'Model' is a Generic Type and 'AccountDocument' is a custom class in test-route.schema.ts
    constructor(@InjectModel('TestRouteSchema') private readonly accountModel: Model<AccountDocument>) {}

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
}
