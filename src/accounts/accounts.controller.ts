/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @UseGuards(AuthGuard)
  @Post('add-account')
  async addaccount(@Body() data: any, @Req() req, @Res() res): Promise<any> {
    if (!req.user) {
      res
        .status(404)
        .json({ status: 404, message: 'user not exists', data: null });
    }
    const id = req.user.id;
    const response: any = await this.accountsService.addAccount(data, id);
    res.status(response.status).json(response);
  }

  @UseGuards(AuthGuard)
  @Post('dlt-account')
  async dltaccount(@Body() data: any, @Req() req, @Res() res): Promise<any> {
    if (!req.user) {
      res
        .status(404)
        .json({ status: 404, message: 'user not exists', data: null });
    }
    const id = req.user.id;
    const accountName = data.accountName;
    const response: any = await this.accountsService.dltAccount(
      accountName,
      id,
    );
    res.status(response.status).json(response);
  }

  @UseGuards(AuthGuard)
  @Get('get-account')
  async getaccount(@Body() data: any, @Req() req, @Res() res): Promise<any> {
    if (!req.user) {
      res
        .status(404)
        .json({ status: 404, message: 'user not exists', data: null });
    }
    const id = req.user.id;
    const accountName = data.accountName;
    const response: any = await this.accountsService.getAccountByName(accountName,id);
    res.status(response.status).json(response);
  }

  @UseGuards(AuthGuard)
  @Get('get-all-accounts')
  async getaccounts(@Body() data: any, @Req() req, @Res() res): Promise<any> {
    if (!req.user) {
      res
        .status(404)
        .json({ status: 404, message: 'user not exists', data: null });
    }
    const id = req.user.id;
    const response: any = await this.accountsService.getAllAccounts(id);
    res.status(response.status).json(response);
  }
}
