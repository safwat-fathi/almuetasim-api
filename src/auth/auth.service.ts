import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { SessionsService } from '../sessions/sessions.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { SignUpDto } from './dto/signup.dto';
import { User } from 'src/users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { plainToClass } from 'class-transformer';
import { UserResponseDto } from 'src/users/dto/user-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private sessionsService: SessionsService,
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

    // Store refresh token in session table
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
    await this.sessionsService.createRefreshToken(
      newUser.id,
      tokens.refreshToken,
      expiresAt,
    );

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

    // Store refresh token in session table
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
    await this.sessionsService.createRefreshToken(
      user.id,
      tokens.refreshToken,
      expiresAt,
    );

    const userDto = plainToClass(UserResponseDto, user, {
      excludeExtraneousValues: true,
    });

    return {
      user: userDto,
      ...tokens,
    };
  }

  async logout(userId: number, refreshToken: string) {
    // Verify the refresh token exists in sessions
    const session = await this.sessionsService.findRefreshToken(refreshToken);

    if (!session) {
      throw new UnauthorizedException('Access Denied');
    }

    // Delete the session
    await this.sessionsService.deleteRefreshToken(refreshToken);
  }

  async refresh(userId: number, refreshToken: string) {
    // Verify the refresh token exists in sessions
    const session = await this.sessionsService.findRefreshToken(refreshToken);

    if (!session) {
      throw new UnauthorizedException('Access Denied');
    }

    // Update last used timestamp
    await this.sessionsService.updateLastUsed(refreshToken);

    // Get user
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.getTokens(user);

    // Update refresh token in session table
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now
    await this.sessionsService.deleteRefreshToken(refreshToken);
    await this.sessionsService.createRefreshToken(
      user.id,
      tokens.refreshToken,
      expiresAt,
    );

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
          expiresIn: process.env.JWT_ACCESS_EXPIRATION,
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
          expiresIn: process.env.JWT_REFRESH_EXPIRATION,
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
