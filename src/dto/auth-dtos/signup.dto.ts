/* eslint-disable prettier/prettier */
import { IsEmail, IsNotEmpty } from 'class-validator';
export class SignUpDto {
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsNotEmpty({ message: 'Name is required' })
  name?: string
}
