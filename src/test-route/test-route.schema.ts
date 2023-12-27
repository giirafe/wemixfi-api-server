import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type AccountDocument = Account & Document

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

@Schema()
export class TransferTx {
    @Prop({required:true})
    senderAddress:string;
    @Prop({required:true})
    receiverAddress:string;
    @Prop({required:true})
    contractAddress:string;
    @Prop({required:true})
    data:string;
    @Prop({required:true})
    timestamp:string;
}

export const TransferTxSchema = SchemaFactory.createForClass(TransferTx);