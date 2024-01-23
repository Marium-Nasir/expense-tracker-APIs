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
import { AuthService } from './auth.service';
import { SignUpDto } from 'src/dto/auth-dtos/signup.dto';
import { AuthGuard } from './auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*---------------------------auth routes -------------------------- */
  @Post('sign-up')
  async signUp(@Body() data: SignUpDto, @Res() res): Promise<any> {
    const response: any = await this.authService.signUpUser(data);
    res.status(response.status).json(response);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data, @Res() res): Promise<any> {
    const email = data.email;
    const otp = data.otp;
    const response: any = await this.authService.verifyOtp(email, otp);
    res.status(response.status).json(response);
  }

  @Post('resend-otp')
  async resendEmail(@Body() data, @Res() res): Promise<any> {
    const email = data.email;
    const response: any = await this.authService.resendOtp(email);
    res.status(response.status).json(response);
  }

  @Post('forgot')
  async forgotPassword(@Body() data, @Res() res): Promise<any> {
    const email = data.email;
    const response: any = await this.authService.forgotPassword(email);
    res.status(response.status).json(response);
  }

  @Post('set-password')
  async setPassword(@Body() data, @Res() res): Promise<any> {
    const response: any = await this.authService.setPassword(data);
    res.status(response.status).json(response);
  }

  @Post('login')
  async loginUser(@Body() data, @Res() res): Promise<any> {
    const response: any = await this.authService.loginUser(data);
    res.status(response.status).json(response);
  }

  /*---------------------------category routes--------------------- */
  @UseGuards(AuthGuard)
  @Post('add-category')
  async addCategory(@Req() req, @Body() data, @Res() res): Promise<any> {
    if(!req.user) {
      res.status(404).json({status: 404, message: "user not exists", data: null})
    }
    const id = req.user.id;
    const category = data.category;
    const response: any = await this.authService.addCategories(category,id);
    res.status(response.status).json(response);
  }

  @UseGuards(AuthGuard)
  @Post('dlt-category')
  async dltCategory(@Req() req, @Body() data, @Res() res): Promise<any> {
    if(!req.user) {
      res.status(404).json({status: 404, message: "user not exists", data: null})
    }
    const id = req.user.id;
    const category = data.category;
    const response: any = await this.authService.dltCategory(category,id);
    res.status(response.status).json(response);
  }

  @UseGuards(AuthGuard)
  @Get('get-categories')
  async getCategories(@Req() req, @Body() data, @Res() res): Promise<any> {
    if(!req.user) {
      res.status(404).json({status: 404, message: "user not exists", data: null})
    }
    const id = req.user.id;
    const response: any = await this.authService.getCategories(id);
    res.status(response.status).json(response);
  }
}
