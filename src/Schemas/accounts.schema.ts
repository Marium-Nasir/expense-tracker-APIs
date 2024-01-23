/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schemas';
import * as mongoose from 'mongoose';
import { Transaction } from './transaction.schema';

interface AccountInterface {
    accountName: string;
    balance: number | 0;
    transactionIds: mongoose.Types.DocumentArray<Transaction>;
  }

@Schema({
  timestamps: true,
})
export class Account {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop({ type: [{}] })
  accounts: AccountInterface[];
}

export const accountSchema = SchemaFactory.createForClass(Account);
