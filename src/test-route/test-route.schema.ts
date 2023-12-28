import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AccountDocument = Account & Document // AccoutDocument로의 확장을 통해 

@Schema()
export class Account {
    @Prop({required: true})
    accountAddress:string;
    @Prop({required: true})
    privateKey:string;
    @Prop() // with no 'required' attr 'description' is optional
    description:string;
}

export const AccountSchema = SchemaFactory.createForClass(Account);


//tx : from, to, contractname, data, timestamp 정도 설정
export type TransferTxDocument = TransferTx & Document

@Schema({ timestamps: true }) // Automatically add 'createdAt' and 'updatedAt'
export class TransferTx {
    @Prop({required:true})
    senderAddress:string;
    @Prop({required:true})
    receiverAddress:string;
    @Prop({required:true})
    amount:number;
    @Prop({required:true})
    contractAddress:string;
    @Prop() // Optional Attr
    data:string;
}

export const TransferTxSchema = SchemaFactory.createForClass(TransferTx);