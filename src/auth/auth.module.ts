import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, userSchema } from 'src/Schemas/user.schemas';
import { MailService } from 'src/mail/mail.service';
import { HandleJwt } from './helpingfunctions/jwt';
import { AccountsModule } from 'src/accounts/accounts.module';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_KEY,
    }),
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
    AccountsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, HandleJwt, AuthGuard],
  exports: [AuthGuard, AuthService],
})
export class AuthModule {}
