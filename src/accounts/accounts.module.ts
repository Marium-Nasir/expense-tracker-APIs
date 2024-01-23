import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { ConfigModule } from '@nestjs/config';
import { Account, accountSchema } from 'src/Schemas/accounts.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthGuard } from 'src/auth/auth.guard';
import { HandleJwt } from 'src/auth/helpingfunctions/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MongooseModule.forFeature([{ name: Account.name, schema: accountSchema }]),
  ],
  controllers: [AccountsController],
  providers: [AccountsService, AuthGuard, HandleJwt],
  exports: [AccountsService],
})
export class AccountsModule {}
