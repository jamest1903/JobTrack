import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { createMockUser } from '../../test/prisma-mock';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: Record<string, jest.Mock>;
  let jwtService: Record<string, jest.Mock>;
  let configService: Record<string, jest.Mock>;

  const mockTokens = {
    accessToken: 'access-token',
    refreshToken: 'refresh-token',
  };

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      updateRefreshToken: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn().mockResolvedValue(mockTokens.accessToken),
    };

    configService = {
      get: jest.fn().mockImplementation((key: string, fallback?: string) => {
        const values: Record<string, string> = {
          JWT_REFRESH_SECRET: 'refresh-secret',
          JWT_REFRESH_EXPIRATION: '7d',
        };
        return values[key] ?? fallback;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    authService = module.get(AuthService);
  });

  describe('register', () => {
    const registerDto = { name: 'Test User', email: 'test@example.com', password: 'password123' };

    it('should register a new user successfully', async () => {
      usersService.findByEmail.mockResolvedValue(null);
      usersService.create.mockResolvedValue(createMockUser());
      jwtService.signAsync.mockResolvedValue(mockTokens.accessToken);

      const result = await authService.register(registerDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });
      expect(usersService.create).toHaveBeenCalledWith({
        ...registerDto,
        password: expect.any(String),
      });
    });

    it('should throw ConflictException if email already exists', async () => {
      usersService.findByEmail.mockResolvedValue(createMockUser());

      await expect(authService.register(registerDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    const loginDto = { email: 'test@example.com', password: 'password123' };

    it('should login successfully with valid credentials', async () => {
      const mockUser = createMockUser({ password: '$2a$12$validhash' });
      usersService.findByEmail.mockResolvedValue(mockUser);

      const bcryptCompare = jest.fn().mockResolvedValue(true);
      jest.spyOn(require('bcryptjs'), 'compare').mockImplementation(bcryptCompare);

      const result = await authService.login(loginDto);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user).toEqual({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      });

      jest.restoreAllMocks();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = createMockUser({ password: '$2a$12$validhash' });
      usersService.findByEmail.mockResolvedValue(mockUser);

      const bcryptCompare = jest.fn().mockResolvedValue(false);
      jest.spyOn(require('bcryptjs'), 'compare').mockImplementation(bcryptCompare);

      await expect(authService.login(loginDto)).rejects.toThrow(UnauthorizedException);

      jest.restoreAllMocks();
    });
  });

  describe('logout', () => {
    it('should clear the refresh token', async () => {
      usersService.updateRefreshToken.mockResolvedValue(undefined);

      await authService.logout(1);

      expect(usersService.updateRefreshToken).toHaveBeenCalledWith(1, null);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const mockUser = createMockUser({ refreshToken: 'hashed-token' });
      usersService.findById.mockResolvedValue(mockUser);

      const bcryptCompare = jest.fn().mockResolvedValue(true);
      jest.spyOn(require('bcryptjs'), 'compare').mockImplementation(bcryptCompare);
      jwtService.signAsync.mockResolvedValue(mockTokens.accessToken);

      const result = await authService.refreshTokens(1, 'refresh-token');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');

      jest.restoreAllMocks();
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      await expect(authService.refreshTokens(999, 'token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if no stored refresh token', async () => {
      usersService.findById.mockResolvedValue(createMockUser({ refreshToken: null }));

      await expect(authService.refreshTokens(1, 'token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if token does not match', async () => {
      const mockUser = createMockUser({ refreshToken: 'hashed-token' });
      usersService.findById.mockResolvedValue(mockUser);

      const bcryptCompare = jest.fn().mockResolvedValue(false);
      jest.spyOn(require('bcryptjs'), 'compare').mockImplementation(bcryptCompare);

      await expect(authService.refreshTokens(1, 'wrong-token')).rejects.toThrow(UnauthorizedException);

      jest.restoreAllMocks();
    });
  });
});
