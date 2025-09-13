import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailExistsDto {
  @ApiProperty({
    description: "The user's email address",
    example: 'john@barbershop.com',
    required: true,
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
