import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Validate,
} from 'class-validator';

import { MatchPasswordsConstraint } from '../validators/match-passwords.validator';

export class ResetPasswordDto {
  @ApiProperty({
    description: "Reset token sent to the user's email",
    example: 'unique-reset-token',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'OTP code',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    description: 'New password for the user',
    example: 'NewSecureP@ssw0rd',
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    },
    {
      message:
        'Password too weak. Must contain uppercase, lowercase, number and special character.',
    },
  )
  password: string;

  @ApiProperty({
    description: 'Confirm new password',
    example: 'NewSecureP@ssw0rd',
  })
  @IsNotEmpty({ message: 'Confirm password is required' })
  @Validate(MatchPasswordsConstraint)
  confirm_password: string;
}
