import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { AuthGuard } from 'src/auth/auth.guard';
import { HandleJwt } from 'src/auth/helpingfunctions/jwt';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Account, accountSchema } from 'src/Schemas/accounts.schema';
import { Transaction, transactionSchema } from 'src/Schemas/transaction.schema';
import { AccountsService } from 'src/accounts/accounts.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: transactionSchema },
    ]),
    MongooseModule.forFeature([{ name: Account.name, schema: accountSchema }]),
    AuthModule,
  ],
  providers: [TransactionsService, AuthGuard, HandleJwt, AccountsService],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
