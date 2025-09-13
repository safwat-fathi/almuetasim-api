import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @ApiProperty({
    description: 'The refresh_token of user',
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1c2VybmFtZSI6IlN1cGVyX01hbmFnZXIiLCJzdWIiOiI2N2QyYTBjZjU2NDUwYjIxZmY2NmNlMTIiLCJpYXQiOjE3NDE4NTc5NDMsImV4cCI6MTc0NDQ0OTk0M30.PAzLRiWbTiNHs13Sv4uopjr5UDgcS_c_TL5N1dQhV3o',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  refresh_token: string;
}
