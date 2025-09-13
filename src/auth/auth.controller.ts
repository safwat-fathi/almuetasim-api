import {
  Controller,
  Post,
  UseGuards,
  Body,
  HttpCode,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import CONSTANTS from 'src/common/constants';
import { RequestUser } from './interfaces/request-user.interface';
import { JwtAuthGuard, JwtRefreshGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Post('/signup')
  // @ApiOperation({ summary: 'Register a new user' })
  // @ApiResponse({
  //   status: 201,
  //   description: 'The user has been successfully signed up.',
  //   type: SignUpResponseDto,
  // })
  // @ApiResponse({ status: 400, description: 'Bad request.' })
  // async signup(@Body() signUpDto: SignUpDto) {
  //   return this.authService.signup(signUpDto);
  // }

  @Post('/login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Login user by email & password' })
  @ApiResponse({ status: 200, description: 'Return the user.' })
  @ApiResponse({ status: 404, description: 'Business not found.' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  // logout
  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Logout user and revoke refresh token' })
  @ApiResponse({ status: 204, description: 'Return no content response.' })
  @ApiResponse({ status: 404, description: 'Not logged in user' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async logout(@Req() req: { user: RequestUser }, @Body() logout: LogoutDto) {
    const { user_id } = req.user;

    await this.authService.logout(parseInt(user_id, 10), logout.refresh_token);
  }

  @ApiBearerAuth(CONSTANTS.ACCESS_TOKEN)
  @UseGuards(JwtRefreshGuard)
  @Post('/refresh')
  @HttpCode(200)
  @ApiOperation({ summary: 'Refresh token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        refresh_token: { type: 'string' },
      },
      required: ['refresh_token'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Return the new access token and refresh token.',
    schema: {
      type: 'object',
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Invalid refresh token.' })
  @ApiResponse({ status: 404, description: 'Business not logged in.' })
  async refresh(
    @Body() body: { refresh_token: string },
    @Req() req: { user: RequestUser },
  ) {
    const { user_id } = req.user;

    return this.authService.refresh(parseInt(user_id, 10), body.refresh_token);
  }
}
