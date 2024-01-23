/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { User } from './user.schemas';
import * as mongoose from 'mongoose';

// interface TransactionInterface {
//   transactionDate: Date,
//   transactionType : string,
//   amount: string,
//   category: string,
// }

@Schema({
  timestamps: true,
})
export class Transaction {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: User;

  @Prop()
  TransactionType: string;

  @Prop()
  amount: string;

  @Prop()
  category: string;

  @Prop()
  accountName: string;
  
  // @Prop({type: [{}]})
  // transactions: TransactionInterface[];
}

export const transactionSchema = SchemaFactory.createForClass(Transaction);
