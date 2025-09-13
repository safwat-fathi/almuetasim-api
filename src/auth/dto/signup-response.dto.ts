// src/auth/dto/sign-up-response.dto.ts
import { OmitType } from '@nestjs/mapped-types';

import { SignUpDto } from './signup.dto';

export class SignUpResponseDto extends OmitType(SignUpDto, [
  'password',
  'confirm_password',
] as const) {}
