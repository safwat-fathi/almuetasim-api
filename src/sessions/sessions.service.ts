import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  async createRefreshToken(
    userId: number,
    refreshToken: string,
    expiresAt: Date,
  ): Promise<Session> {
    const session = this.sessionRepository.create({
      userId,
      refreshToken,
      expiresAt,
    });
    return this.sessionRepository.save(session);
  }

  async findRefreshToken(refreshToken: string): Promise<Session | null> {
    return this.sessionRepository.findOne({
      where: { refreshToken },
      relations: ['user'],
    });
  }

  async updateLastUsed(refreshToken: string): Promise<void> {
    await this.sessionRepository.update(
      { refreshToken },
      { lastUsedAt: new Date() },
    );
  }

  async deleteRefreshToken(refreshToken: string): Promise<void> {
    await this.sessionRepository.delete({ refreshToken });
  }

  async deleteExpiredSessions(): Promise<void> {
    await this.sessionRepository
      .createQueryBuilder()
      .delete()
      .from(Session)
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }

  async deleteAllUserSessions(userId: number): Promise<void> {
    await this.sessionRepository.delete({ userId });
  }
}
