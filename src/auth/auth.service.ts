import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from './dto/signup.dto';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { plainToClass } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user-response.dto';
import CONSTANTS from 'src/common/constants';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(signUpDto: SignUpDto) {
    const { email } = signUpDto;

    const userExists = await this.usersService.findOneByEmail(email);

    if (userExists) {
      throw new ConflictException('User with this email already exists.');
    }

    const newUser = await this.usersService.create(signUpDto);

    const tokens = await this.getTokens(newUser);
    await this.usersService.update(newUser.id, {
      refresh_token: tokens.refreshToken,
    });

    const userDto = plainToClass(UserResponseDto, newUser, {
      excludeExtraneousValues: true,
    });

    return {
      user: userDto,
      ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new UnauthorizedException('Invalid credentials.');
    }

    const tokens = await this.getTokens(user);
    await this.usersService.update(user.id, {
      refresh_token: tokens.refreshToken,
    });

    const userDto = plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      user: userDto,
      ...tokens,
    };
  }

  async logout(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Access Denied');
    }

    if (user.refresh_token !== refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    await this.usersService.update(userId, {
      refresh_token: null,
    });
  }

  async refresh(userId: number, refreshToken: string) {
    const user = await this.usersService.findOne(userId);

    if (!user || !user.refresh_token) {
      throw new UnauthorizedException('Access Denied');
    }

    if (user.refresh_token !== refreshToken) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(user);
    await this.usersService.update(user.id, {
      refresh_token: tokens.refreshToken,
    });

    return tokens;
  }

  async getTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: 'access',
        },
        {
          secret: process.env.JWT_SECRET,
          expiresIn: CONSTANTS.SESSION.ACCESS_TOKEN_EXPIRATION_TIME,
        },
      ),
      this.jwtService.signAsync(
        {
          sub: user.id,
          email: user.email,
          type: 'refresh',
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: CONSTANTS.SESSION.REFRESH_TOKEN_EXPIRATION_TIME,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
