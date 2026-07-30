import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, closeApp, generateAccessToken, createPrismaMock } from './test-setup';
import { createMockUser } from './prisma-mock';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prismaMock: ReturnType<typeof createPrismaMock>;
  let jwtService: JwtService;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    prismaMock = setup.prismaMock;
    jwtService = setup.jwtService;
  });

  afterAll(async () => {
    await closeApp(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      (prismaMock.user.findUnique as any).mockResolvedValue(null);
      (prismaMock.user.create as any).mockResolvedValue(
        createMockUser({ id: 1, name: 'New User', email: 'new@example.com' }),
      );
      (prismaMock.user.update as any).mockResolvedValue(undefined);

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'New User',
          email: 'new@example.com',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.user).toEqual({
        id: 1,
        email: 'new@example.com',
        name: 'New User',
      });
    });

    it('should return 409 if email already exists', async () => {
      (prismaMock.user.findUnique as any).mockResolvedValue(
        createMockUser({ email: 'existing@example.com' }),
      );

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'existing@example.com',
          password: 'password123',
        })
        .expect(409);
    });

    it('should return 400 for missing name', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for invalid email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'not-an-email',
          password: 'password123',
        })
        .expect(400);
    });

    it('should return 400 for short password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          name: 'Test',
          email: 'test@example.com',
          password: 'short',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      (prismaMock.user.findUnique as any).mockResolvedValue(
        createMockUser({ email: 'test@example.com' }),
      );
      (prismaMock.user.update as any).mockResolvedValue(undefined);

      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);

      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        })
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');

      jest.restoreAllMocks();
    });

    it('should return 401 for non-existent user', async () => {
      (prismaMock.user.findUnique as any).mockResolvedValue(null);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);
    });

    it('should return 401 for wrong password', async () => {
      (prismaMock.user.findUnique as any).mockResolvedValue(
        createMockUser({ email: 'test@example.com' }),
      );

      const bcrypt = require('bcryptjs');
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
        .expect(401);

      jest.restoreAllMocks();
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully with valid token', async () => {
      (prismaMock.user.update as any).mockResolvedValue(undefined);

      const token = generateAccessToken(jwtService, { sub: 1, email: 'test@example.com' });

      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .expect(401);
    });
  });
});
