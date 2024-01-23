/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from 'src/Schemas/transaction.schema';
import { AccountsService } from 'src/accounts/accounts.service';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly TransacModel: Model<Transaction>,
    private readonly accountsService: AccountsService,
    private readonly authService: AuthService,
  ) {}

  async createTransaction(data, id): Promise<any> {
    try {
      if (
        data.accountName === undefined ||
        data.type === undefined ||
        data.amount === undefined ||
        data.category === undefined ||
        id === undefined
      ) {
        const res = {
          status: 400,
          message: 'accountName, type, amount, category, or id missing',
          data: null,
        };
        return res;
      } else {
        data.accountName = data.accountName.toLowerCase();
        data.category = data.category.toLowerCase();
        data.type = data.type.toLowerCase();

        const user = await this.authService.getUserById(id);
        if (!user.categories.includes(data.category)) {
          const res = {
            status: 400,
            message: `${data.category} category does not exist for the user`,
            data: null,
          };
          return res;
        }

        const accountExists: any = await this.accountsService.getAccountByName(
          data.accountName,
          id,
        );

        if (accountExists.status === 404) {
          return accountExists;
        }

        if (accountExists.status === 200) {
          const transacData = {
            userId: id,
            accountName:data.accountName,
            amount: parseInt(data.amount),
            category: data.category,
            TransactionType: data.type,
          };

          let test;
          if (data.type === 'income') {
            test = await this.accountsService.income(
              id,
              data.amount,
              data.accountName,
            );
          }
          if (data.type === 'expense') {
            test = await this.accountsService.expense(
              id,
              data.amount,
              data.accountName,
            );
          }
          if (test && test.status === 200) {
            const createTransac = await this.TransacModel.create(transacData);
            if (createTransac) {
               await this.accountsService.updAcc(
                id,
                createTransac._id,
                data.accountName,
              );
            }
        }
        return test;
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error occurred during create transaction',
        data: err,
      };
      return res;
    }
  }

  async findByType(type: string,id): Promise<object> {
    try{
      if(id === undefined || type === undefined) {
        const res = {
          status: 400,
          message:"id or type is missing",
          data: null
        }
        return res;
      } else {
        const getTransac = await this.TransacModel.find({userId:id, TransactionType: type}).populate({
          path: 'userId',
          model: 'User',
          select: 'name email',
        });
        if(getTransac.length>0) {
          const res = {
            status: 200,
            message: "Success",
            data: getTransac,
          }
          return res;
        } else {
          const res = {
            status: 200,
            message: "There is no transaction for this transaction type",
            data: getTransac,
          }
          return res;
        }
      }
    }catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error occurred',
        data: err,
      };
      return res;
    }
  }

  async findByTypeOrAccount(accountName: string, type: string, id): Promise<object> {
    try{
      if(id === undefined || type === undefined) {
        const res = {
          status: 400,
          message:"id or type is missing",
          data: null
        }
        return res;
      } else {
        const getTransac = await this.TransacModel.find({userId:id, TransactionType: type, accountName}).populate({
          path: 'userId',
          model: 'User',
          select: 'name email',
        });
        if(getTransac.length>0) {
          const res = {
            status: 200,
            message: "Success",
            data: getTransac,
          }
          return res;
        } else {
          const res = {
            status: 200,
            message: "There is no transaction for this transaction type or in this account",
            data: getTransac,
          }
          return res;
        }
      }
    }catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error occurred',
        data: err,
      };
      return res;
    }
  }
}
