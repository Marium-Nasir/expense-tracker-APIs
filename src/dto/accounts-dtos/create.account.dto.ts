/* eslint-disable prettier/prettier */
import { IsNotEmpty } from 'class-validator';

// type AccountInterface = {
//     accountName: string;
//     balance: number | 0;
//     transactionIds: string;
//   }
export class CreateAccountDto {
  @IsNotEmpty()
  userId: any;

  @IsNotEmpty()
  accounts:any;
}
