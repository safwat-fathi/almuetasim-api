import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: "The user's email address",
    example: 'ali@test.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: "The user's password",
    example: 'NewSecureP@ssw0rd',
    required: true,
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
