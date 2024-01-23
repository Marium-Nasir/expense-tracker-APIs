import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from './Schemas/user.schemas';
import { HandleJwt } from './auth/helpingfunctions/jwt';
import { MailModule } from './mail/mail.module';
import { AccountsModule } from './accounts/accounts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { Account, accountSchema } from './Schemas/accounts.schema';
import { AccountsService } from './accounts/accounts.service';
import { TransactionsService } from './transactions/transactions.service';
import { Transaction, transactionSchema } from './Schemas/transaction.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.DB_URI),
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    MongooseModule.forFeature([{ name: Account.name, schema: accountSchema }]),
    MongooseModule.forFeature([
      { name: Transaction.name, schema: transactionSchema },
    ]),
    AuthModule,
    MailModule,
    AccountsModule,
    TransactionsModule,
    AccountsModule,
    TransactionsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, HandleJwt, AccountsService, TransactionsService],
})
export class AppModule {}
