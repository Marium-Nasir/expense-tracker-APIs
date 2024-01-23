/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Account } from 'src/Schemas/accounts.schema';
import { CreateAccountDto } from 'src/dto/accounts-dtos/create.account.dto';
// import { CreateAccountDto } from 'src/dto/accounts-dtos/create.account.dto';

@Injectable()
export class AccountsService {
  constructor(
    @InjectModel(Account.name)
    private readonly accountModel: Model<Account>,
  ) {}

  async createAccount(createAccount: CreateAccountDto): Promise<any> {
    try {
      const createdAccount = await this.accountModel.create(createAccount);
      if (createdAccount) {
        return createdAccount._id;
      } else {
        const res = {
          status: 400,
          message: 'error occurred',
          data: createdAccount,
        };
        return res;
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'error occurred in creating account',
        data: err,
      };
      return res;
    }
  }

  async addAccount(data, id): Promise<object> {
    try {
      if (data.accountName === undefined || id === undefined) {
        const res = {
          status: 400,
          message: 'accountName or id is missing',
          data: null,
        };
        return res;
      }
      data.accountName = data.accountName.toLowerCase();
      const accountExists = await this.accountModel.findOne({
        userId: id,
        accounts: {
          $elemMatch: {
            accountName: data.accountName,
          },
        },
      });
      if (accountExists) {
        const res = {
          status: 400,
          message: `${data.accountName} is already exists`,
          data: accountExists.accounts,
        };
        return res;
      } else {
        data.balance = parseInt(data.balance);
        const newAccountData = {
          accountName: data.accountName,
          balance: data.balance | 0,
          transactionIds: [],
        };
        const newAccount = await this.accountModel.findOneAndUpdate(
          { userId: id },
          {
            $addToSet: { accounts: newAccountData },
          },
          { new: true },
        );
        if (newAccount) {
          const res = {
            status: 400,
            message: `${data.accountName} is added`,
            data: newAccount,
          };
          return res;
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'error occurred in adding account',
        data: err,
      };
      return res;
    }
  }

  async dltAccount(accountName, id): Promise<object> {
    try {
      if (accountName === undefined || id === undefined) {
        return {
          status: 400,
          message: 'accountName or id is missing',
          data: null,
        };
      }

      accountName = accountName.toLowerCase();
      if (accountName === 'cash' || accountName === 'saving') {
        return {
          status: 400,
          message: 'Unable to delete cash and saving accounts',
          data: null,
        };
      }

      const result = await this.accountModel.findOneAndUpdate(
        {
          userId: id,
          accounts: {
            $elemMatch: {
              accountName: accountName,
            },
          },
        },
        {
          $pull: {
            accounts: { accountName: accountName },
          },
        },
        { new: true },
      );

      if (!result) {
        return {
          status: 404,
          message: `${accountName} account is not exists`,
          data: null,
        };
      }

      return {
        status: 200,
        message: `${accountName} is deleted`,
        data: result,
      };
    } catch (err) {
      console.error(err);
      return {
        status: 500,
        message: 'Error occurred while deleting account',
        data: err,
      };
    }
  }

  async getAllAccounts(id): Promise<object> {
    try {
      if (id === undefined) {
        const res = {
          status: 400,
          message: 'id is missing',
          data: null,
        };
        return res;
      }
      const allAccounts = await this.accountModel
        .findOne({ userId: id })
        .populate({
          path: 'accounts.transactionIds',
          model: 'Transaction',
          select: 'amount category TransactionType',
        });
      console.log(allAccounts.accounts);

      if (allAccounts) {
        const res = {
          status: 200,
          message: 'Successfully get all accounts',
          data: allAccounts.accounts,
        };
        return res;
      } else {
        const res = {
          status: 404,
          message: 'Accounts not found',
          data: null,
        };
        return res;
      }
    } catch (err) {
      console.error(err);
      const res = {
        status: 500,
        message: 'Error occurred while getting all accounts',
        data: err,
      };
      return res;
    }
  }

  async getAccountByName(accountName, id): Promise<object> {
    try {
      if (accountName === undefined || id === undefined) {
        const res = {
          status: 400,
          message: 'accountName or id is missing',
          data: null,
        };
        return res;
      }
      accountName = accountName.toLowerCase();
      const accountExists = await this.accountModel
        .findOne(
          {
            userId: id,
            accounts: {
              $elemMatch: {
                accountName: accountName,
              },
            },
          },
          { 'accounts.$': 1 },
        )
        .populate({
          path: 'accounts.transactionIds',
          model: 'Transaction',
          select: 'amount category TransactionType',
        });
      if (accountExists) {
        const res = {
          status: 200,
          message: 'Success',
          data: accountExists.accounts[0],
        };
        return res;
      } else {
        const res = {
          status: 404,
          message: `${accountName} this account is not exists`,
          data: null,
        };
        return res;
      }
    } catch (err) {
      console.error(err);
      const res = {
        status: 500,
        message: 'Error occurred while getting account',
        data: err,
      };
      return res;
    }
  }

  async income(id, amount, accountName): Promise<object> {
    try {
      const parsedAmount = parseInt(amount);

      const updatedAccount = await this.accountModel.findOneAndUpdate(
        {
          userId: id,
          'accounts.accountName': accountName,
        },
        {
          $inc: { 'accounts.$.balance': parsedAmount },
        },
        { new: true },
      );

      if (updatedAccount) {
        return {
          status: 200,
          message: 'Balance updated successfully',
          data: updatedAccount,
        };
      } else {
        return {
          status: 404,
          message: `${accountName} account not found`,
          data: null,
        };
      }
    } catch (err) {
      console.error(err);
      return {
        status: 500,
        message: 'Error occurred during update balance',
        data: err,
      };
    }
  }

  async expense(id, amount, accountName): Promise<object> {
    try {
      const parsedAmount = parseInt(amount);

      const account = await this.accountModel.findOne({
        userId: id,
        'accounts.accountName': accountName,
      });
      if (account) {
        const currentBalance = account.accounts.find(
          (acc) => acc.accountName === accountName,
        ).balance;

        if (currentBalance >= parsedAmount) {
          const updatedAccount = await this.accountModel.findOneAndUpdate(
            {
              userId: id,
              'accounts.accountName': accountName,
            },
            {
              $inc: { 'accounts.$.balance': -parsedAmount },
            },
            { new: true },
          );

          const res = {
            status: 200,
            message: 'Expense processed successfully',
            data: updatedAccount,
          };
          return res;
        } else {
          const res = {
            status: 400,
            message: 'Insufficient balance in your account for the expense',
            data: null,
          };
          return res;
        }
      }
    } catch (err) {
      console.error(err);
      const res = {
        status: 500,
        message: 'Error occurred during expense processing',
        data: err,
      };
      return res;
    }
  }

  async updAcc(id, transacId, accountName): Promise<any> {
    try {
      const updatedAccount = await this.accountModel.findOneAndUpdate(
        {
          userId: id,
          'accounts.accountName': accountName,
        },
        {
          $addToSet: { 'accounts.$.transactionIds': transacId },
        },
        { new: true },
      );
      if (updatedAccount) return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
}
