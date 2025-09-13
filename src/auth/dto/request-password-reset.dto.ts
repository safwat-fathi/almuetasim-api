import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Registered email address of the user',
    example: 'owner@barbershop.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
