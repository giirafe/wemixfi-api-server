import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table
export class Account extends Model<Account> {
  @Column({
    allowNull: false,
    primaryKey: true,
    type: DataType.STRING
  })
  accountAddress: string;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  privateKey: string;

  @Column(DataType.STRING)
  description: string;
}

@Table
export class TransferTx extends Model<TransferTx> {
  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  senderAddress: string;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  receiverAddress: string;

  @Column({
    allowNull: false,
    type: DataType.DECIMAL(10, 2) // or another appropriate type based on your requirements
  })
  amount: number;

  @Column({
    allowNull: false,
    type: DataType.STRING
  })
  contractAddress: string;

  @Column(DataType.TEXT) // 'TEXT' for potentially large JSON data
  data: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}