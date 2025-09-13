import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty()
  @Expose()
  id: number;

  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty({ required: false })
  @Expose()
  bio?: string;

  @ApiProperty({ required: false })
  @Expose()
  profile_image?: string;

  @ApiProperty({ required: false })
  @Expose()
  theme_color?: string;
}
