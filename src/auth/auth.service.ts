/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/Schemas/user.schemas';
import { MailService } from 'src/mail/mail.service';
import { HandleJwt } from './helpingfunctions/jwt';
import { SignUpDto } from 'src/dto/auth-dtos/signup.dto';
import { validate } from 'class-validator';
import { verifyEmailTemplate } from 'src/mail/templates/verifyemail';
import { AccountsService } from 'src/accounts/accounts.service';
// import { CreateAccountDto } from 'src/dto/accounts-dtos/create.account.dto';
import { forgotPasswordTemplate } from 'src/mail/templates/forgotpasswor';
import { LogInDto } from 'src/dto/auth-dtos/login.dto';
import * as bcrypt from 'bcryptjs';
import { EmailDto } from 'src/dto/auth-dtos/email.dto';
import { CreateAccountDto } from 'src/dto/accounts-dtos/create.account.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly mailService: MailService,
    private readonly handleJwt: HandleJwt,
    private readonly accountService: AccountsService,
  ) {}

  async sendEmails(
    data,
    successStatus,
    failureStatus,
    template,
  ): Promise<object> {
    const otp = this.generateSixDigitCode();
    const isSent = await this.mailService.sendEmail(data, otp, template);

    if (isSent === 'success') {
      const expirationTime = new Date();
      expirationTime.setMinutes(expirationTime.getMinutes() + 2);
      const userVal = await this.userModel
        .findOneAndUpdate(
          { email: data.email },
          { otpCode: { otp: otp, expiresIn: expirationTime } },
          { new: true },
        )
        .populate({
          path: 'accountId',
          select: '-userId',
        })
        .exec();
      if (userVal) {
        const res = {
          status: successStatus,
          message: 'Email Sent',
          data: userVal,
        };
        return res;
      }
    } else {
      const res = {
        status: failureStatus,
        message: 'Email not sent',
        data: null,
      };
      return res;
    }
  }

  generateSixDigitCode(): string {
    const min = 100000;
    const max = 999999;
    const sixDigitCode = Math.floor(Math.random() * (max - min + 1)) + min;
    return sixDigitCode.toString();
  }

  async signUpUser(data: SignUpDto): Promise<object> {
    try {
      if (data.email === undefined || data.name === undefined) {
        const res = {
          status: 500,
          message: 'name or email missing',
          data: null,
        };
        return res;
      }
      const email = data.email.toLowerCase();
      const signUpData = new SignUpDto();
      signUpData.email = data.email;
      signUpData.name = data.name;
      const validationErrors = await validate(signUpData);

      if (validationErrors.length > 0) {
        const res = {
          status: 400,
          message: 'Validation failed',
          data: validationErrors,
        };
        return res;
      } else {
        const user = await this.userModel.findOne({ email: email });
        if (user) {
          if (user.password) {
            const res = {
              status: 400,
              message: 'Account already exists',
              data: null,
            };
            return res;
          } else {
            return await this.sendEmails(user, 200, 400, verifyEmailTemplate);
          }
        }
        if (!user) {
          const newUser = await this.userModel.create(data);
          const cashAccount: CreateAccountDto = {
            userId: newUser._id,
            accounts: [
              {
                accountName: 'cash',
                balance: 0,
                transactionIds: [],
              },
              {
                accountName: 'saving',
                balance: 0,
                transactionIds: [],
              },
            ],
          };
          const createDefaultAccounts =
            await this.accountService.createAccount(cashAccount);
          if (!createDefaultAccounts) {
            const res = {
              status: 400,
              message: 'Error Occurred while creating default accounts',
              data: createDefaultAccounts,
            };
            return res;
          }
          if (newUser) {
            const updatedUser = await this.userModel.findByIdAndUpdate(
              { _id: newUser._id },
              { accountId: createDefaultAccounts._id },
              { new: true },
            );
            // console.log(createDefaultAccounts._id + ' hhhhhhh');

            if (updatedUser) {
              return await this.sendEmails(
                updatedUser,
                201,
                400,
                verifyEmailTemplate,
              );
            }
          }
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'failed to create user in db',
        data: err,
      };
      return res;
    }
  }

  async verifyOtp(email: string, otp: string): Promise<object> {
    try {
      if (email === undefined || otp === undefined) {
        const res = {
          status: 500,
          message: 'email or otp missing',
          data: null,
        };
        return res;
      }
      const user = await this.userModel.findOne({ email: email });

      if (!user) {
        const res = {
          status: 404,
          message: 'User not found',
          data: null,
        };
        return res;
      }
      if (user) {
        const storedOtpData = user.otpCode;

        if (!storedOtpData || storedOtpData.otp !== otp) {
          const res = {
            status: 400,
            message: 'Invalid OTP',
            data: null,
          };
          return res;
        }

        const currentDateTime = new Date();
        const expirationTime = new Date(storedOtpData.expiresIn);

        if (currentDateTime > expirationTime) {
          const res = {
            status: 400,
            message: 'OTP has expired',
            data: null,
          };
          return res;
        } else {
          const isVerified = user.isVerified;
          if (isVerified === false) {
            const updateData = await this.userModel.findOneAndUpdate(
              { email: email },
              { isVerified: true },
              { new: true },
            );

            if (updateData) {
              const res = {
                status: 200,
                message: 'email verified',
                data: updateData,
              };
              return res;
            }
          } else {
            const res = {
              status: 200,
              message: 'email verified',
              data: null,
            };
            return res;
          }
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during OTP verification',
        data: err,
      };
      return res;
    }
  }

  async resendOtp(email: string): Promise<object> {
    try {
      if (email === undefined) {
        const res = {
          status: 500,
          message: 'email missing',
          data: null,
        };
        return res;
      }
      email = email.toLowerCase();
      const Data = new EmailDto();
      Data.email = email;
      const validationErrors = await validate(Data);

      if (validationErrors.length > 0) {
        const res = {
          status: 400,
          message: 'Validation failed',
          data: validationErrors,
        };
        return res;
      } else {
        const user = await this.userModel.findOne({ email: email });
        if (!user) {
          const res = {
            status: 404,
            message: 'User not found',
            data: null,
          };
          return res;
        }
        if (user.password) {
          return await this.sendEmails(user, 200, 400, forgotPasswordTemplate);
        } else {
          return await this.sendEmails(user, 200, 400, verifyEmailTemplate);
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during sending otp',
        data: err,
      };
      return res;
    }
  }

  async setPassword(data: LogInDto): Promise<object> {
    try {
      if (data.email === undefined || data.password === undefined) {
        const res = {
          status: 500,
          message: 'password or email missing',
          data: null,
        };
        return res;
      }
      const email = data.email.toLowerCase();
      const setPasswordData = new LogInDto();
      setPasswordData.email = data.email;
      setPasswordData.password = data.password;
      const validationErrors = await validate(setPasswordData);
      console.log(validationErrors + ' from validation');

      if (validationErrors.length > 0) {
        const res = {
          status: 400,
          message: 'Validation failed',
          data: validationErrors,
        };
        return res;
      } else {
        const user = await this.userModel.findOne({ email });
        if (!user) {
          const res = {
            status: 404,
            message: 'User not found',
            data: null,
          };
          return res;
        }
        if (user.isVerified === true) {
          const hashedPassword = await bcrypt.hash(data.password, 10);
          const setPass = await this.userModel.findOneAndUpdate(
            { email },
            { password: hashedPassword },
            { new: true },
          );
          if (setPass) {
            const res = {
              status: 200,
              message: 'Password set successfully',
              data: setPass,
            };
            return res;
          }
        } else {
          const res = {
            status: 400,
            message: 'Email not verified',
            data: null,
          };
          return res;
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during set password',
        data: err,
      };
      return res;
    }
  }

  async forgotPassword(email: string): Promise<object> {
    try {
      if (email === undefined) {
        const res = {
          status: 500,
          message: 'email missing',
          data: null,
        };
        return res;
      }
      email = email.toLowerCase();
      const Data = new EmailDto();
      Data.email = email;
      const validationErrors = await validate(Data);

      if (validationErrors.length > 0) {
        const res = {
          status: 400,
          message: 'Validation failed',
          data: validationErrors,
        };
        return res;
      } else {
        const passwordExists = await this.userModel.findOne({
          email: email,
          password: { $exists: true },
        });
        if (passwordExists === null) {
          const res = {
            status: 404,
            message: 'User not exists',
            data: null,
          };
          return res;
        } else {
          return await this.sendEmails(
            passwordExists,
            200,
            400,
            forgotPasswordTemplate,
          );
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during send forgot password request',
        data: err,
      };
      return res;
    }
  }

  async loginUser(data: LogInDto): Promise<object> {
    try {
      if (data.email === undefined || data.password === undefined) {
        const res = {
          status: 500,
          message: 'email or password missing',
          data: null,
        };
        return res;
      }
      const email = data.email.toLowerCase();
      const password = data.password;
      const Data = new EmailDto();
      Data.email = data.email;
      const validationErrors = await validate(Data);

      if (validationErrors.length > 0) {
        const res = {
          status: 400,
          message: 'Validation failed',
          data: validationErrors,
        };
        return res;
      } else {
        const passwordExists = await this.userModel.findOne({
          email: email,
          password: { $exists: true },
        }).populate('accountId','accounts');
        if (passwordExists === null) {
          const res = {
            status: 400,
            message: 'Invalid Credentials',
            data: null,
          };
          return res;
        }
        if (passwordExists != null) {
          const pass = await bcrypt.compare(password, passwordExists.password);
          const payload = { id: passwordExists._id };
          const time = 7200;
          const token = await this.handleJwt.genToken(payload, time);
          if (pass) {
            const res = {
              status: 200,
              message: 'Sign-in Successfully',
              data: passwordExists,
              token,
            };
            return res;
          }
          if (!pass) {
            const res = {
              status: 400,
              message: 'Invalid Credentials',
              data: null,
            };
            return res;
          }
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Error during sign-in user',
        data: err,
      };
      return res;
    }
  }

  async getUserById(id): Promise<any> {
    try{
      const user = await this.userModel.findById({_id:id});
      return user;
    }catch(err){
      console.log(err);
      return false;
    }
  }

  async addCategories(categoryName: string, id: any): Promise<object> {
    try {
      if (categoryName === undefined) {
        const res = {
          status: 404,
          message: 'Category name is missing',
          data: null,
        };
        return res;
      } else {
        categoryName = categoryName.toLowerCase();

        const user = await this.userModel.findById(id);
        if (user?.categories.includes(categoryName)) {
          const res = {
            status: 400,
            message: 'Category already exists',
            data: null,
          };
          return res;
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(
          { _id: id },
          { $push: { categories: categoryName } },
          { new: true },
        );

        if (updatedUser) {
          const res = {
            status: 200,
            message: 'Category added',
            data: updatedUser.categories,
          };
          return res;
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Category not added',
        data: err,
      };
      return res;
    }
  }

  async dltCategory(categoryName: string, id: any): Promise<object> {
    try {
      if (categoryName === undefined) {
        const res = {
          status: 404,
          message: 'Category name is missing',
          data: null,
        };
        return res;
      } else {
        const user = await this.userModel.findById(id);
        if (!user?.categories.includes(categoryName)) {
          const res = {
            status: 400,
            message: 'Category not exists',
            data: null,
          };
          return res;
        }

        const updatedUser = await this.userModel.findByIdAndUpdate(
          { _id: id },
          { $pull: { categories: categoryName } },
          { new: true },
        );

        if (updatedUser) {
          const res = {
            status: 200,
            message: 'Category deleted',
            data: updatedUser.categories,
          };
          return res;
        }
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Category not deleted',
        data: err,
      };
      return res;
    }
  }

  async getCategories(id: any): Promise<object> {
    try {
      const user = await this.userModel.findById(id);
      if (user) {
        const res = {
          status: 200,
          message: 'categories',
          data: user.categories,
        };
        return res;
      }
    } catch (err) {
      console.log(err);
      const res = {
        status: 500,
        message: 'Categories not found',
        data: err,
      };
      return res;
    }
  }
}
