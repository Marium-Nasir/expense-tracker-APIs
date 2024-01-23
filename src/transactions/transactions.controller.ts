/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionsService) {}

  @UseGuards(AuthGuard)
  @Post('create-transaction')
  async createTransaction(
    @Body() data: any,
    @Req() req,
    @Res() res,
  ): Promise<any> {
    if (!req.user) {
      res
        .status(404)
        .json({ status: 404, message: 'user not exists', data: null });
    }
    const id = req.user.id;
    const response: any = await this.transactionService.createTransaction(
      data,
      id,
    );
    res.status(response.status).json(response);
  }

  @UseGuards(AuthGuard)
  @Get('get-by-type')
  async getByType(@Body() data: any, @Req() req, @Res() res): Promise<any> {
    if (!req.user) {
      res
        .status(404)
        .json({ status: 404, message: 'user not exists', data: null });
    }
    const id = req.user.id;
    const type = data.type;
    const response: any = await this.transactionService.findByType(type, id);
    res.status(response.status).json(response);
  }

  @UseGuards(AuthGuard)
  @Get('get-by-type-account')
  async getByTypeOrAccount(
    @Body() data: any,
    @Req() req,
    @Res() res,
  ): Promise<any> {
    if (!req.user) {
      res
        .status(404)
        .json({ status: 404, message: 'user not exists', data: null });
    }
    const id = req.user.id;
    const type = data.type;
    const accountName = data.accountName;
    const response: any = await this.transactionService.findByTypeOrAccount(
      accountName,
      type,
      id,
    );
    res.status(response.status).json(response);
  }
}
