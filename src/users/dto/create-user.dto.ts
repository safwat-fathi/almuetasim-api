import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Validate,
} from 'class-validator';
import { MatchPasswordsConstraint } from 'src/auth/validators/match-passwords.validator';

export class CreateUserDto {
  @ApiProperty({ description: 'User name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'User email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

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

  @ApiProperty({ description: 'User bio', required: false })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiProperty({ description: 'User profile image', required: false })
  @IsString()
  @IsOptional()
  profile_image?: string;

  @ApiProperty({ description: 'User theme color', required: false })
  @IsString()
  @IsOptional()
  theme_color?: string;
}
