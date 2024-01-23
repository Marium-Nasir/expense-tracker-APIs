/* eslint-disable prettier/prettier */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Account } from './accounts.schema';

@Schema({
  timestamps: true,
})
export class User {
  @Prop({required: true})
  name: string;

  @Prop({
    unique: [true, 'Email already exists'],
    required: true,
    set: (value: string) => value.toLowerCase(),
  })
  email: string;

  @Prop()
  password: string;

  @Prop({ type: [String], default: ['medical','traveling','shopping'] })
  categories: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
  accountId: Account;

  @Prop({ type: Object })
  otpCode: { otp: string; expiresIn: string };

  @Prop({default: false})
  isVerified: boolean;
}

export const userSchema = SchemaFactory.createForClass(User);
