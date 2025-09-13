import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Refresh token for the user',
    required: false,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  refresh_token?: string | null;
}
