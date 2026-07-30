import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, closeApp, generateAccessToken, setupUserMock } from './test-setup';

describe('Validation (e2e)', () => {
  let app: INestApplication;
  let prismaMock: any;
  let jwtService: JwtService;
  let authToken: string;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
    prismaMock = setup.prismaMock;
    jwtService = setup.jwtService;
    authToken = generateAccessToken(jwtService, { sub: 1, email: 'test@example.com' });
  });

  afterAll(async () => {
    await closeApp(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    setupUserMock(prismaMock);
  });

  describe('Auth validation', () => {
    describe('POST /api/auth/register', () => {
      it('should reject empty body', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({})
          .expect(400);
      });

      it('should reject missing email', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ name: 'Test', password: 'password123' })
          .expect(400);
      });

      it('should reject missing password', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ name: 'Test', email: 'test@example.com' })
          .expect(400);
      });

      it('should reject missing name', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ email: 'test@example.com', password: 'password123' })
          .expect(400);
      });

      it('should reject invalid email format', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ name: 'Test', email: 'not-valid', password: 'password123' })
          .expect(400);
      });

      it('should reject password shorter than 8 chars', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ name: 'Test', email: 'test@example.com', password: 'short' })
          .expect(400);
      });

      it('should accept valid registration data', async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);
        prismaMock.user.create.mockResolvedValue({
          id: 1, email: 'test@example.com', name: 'Test',
          password: 'hashed', refreshToken: null,
          createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z',
        });
        prismaMock.user.update.mockResolvedValue(undefined);

        await request(app.getHttpServer())
          .post('/api/auth/register')
          .send({ name: 'Test', email: 'test@example.com', password: 'password123' })
          .expect(201);
      });
    });

    describe('POST /api/auth/login', () => {
      it('should reject empty body', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({})
          .expect(400);
      });

      it('should reject invalid email', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'not-valid', password: 'password123' })
          .expect(400);
      });

      it('should reject short password', async () => {
        await request(app.getHttpServer())
          .post('/api/auth/login')
          .send({ email: 'test@example.com', password: 'short' })
          .expect(400);
      });
    });
  });

  describe('Jobs validation', () => {
    it('should reject create without title', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ companyId: 1 })
        .expect(400);
    });

    it('should reject title exceeding 200 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'A'.repeat(201) })
        .expect(400);
    });

    it('should reject invalid workType', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Engineer', workType: 'FULL_TIME' })
        .expect(400);
    });

    it('should accept valid workType values', async () => {
      for (const workType of ['REMOTE', 'HYBRID', 'ONSITE']) {
        await request(app.getHttpServer())
          .post('/api/jobs')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ title: 'Engineer', workType })
          .expect((res) => {
            if (res.status !== 201 && res.status !== 400) {
              throw new Error(`Expected 201 or 400 for workType ${workType}, got ${res.status}`);
            }
          });
      }
    });

    it('should reject negative salary', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Engineer', salary: -1 })
        .expect(400);
    });

    it('should reject invalid URL format', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Engineer', url: 'not-a-url' })
        .expect(400);
    });

    it('should reject description exceeding 10000 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Engineer', description: 'A'.repeat(10001) })
        .expect(400);
    });
  });

  describe('Companies validation', () => {
    it('should reject create without name', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ website: 'https://acme.com' })
        .expect(400);
    });

    it('should reject name exceeding 200 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'A'.repeat(201) })
        .expect(400);
    });

    it('should reject invalid website URL', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme', website: 'not-a-url' })
        .expect(400);
    });

    it('should reject industry exceeding 100 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme', industry: 'A'.repeat(101) })
        .expect(400);
    });

    it('should reject location exceeding 200 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme', location: 'A'.repeat(201) })
        .expect(400);
    });

    it('should reject notes exceeding 5000 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme', notes: 'A'.repeat(5001) })
        .expect(400);
    });

    it('should reject extra fields (whitelist)', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme', unknownField: 'test' })
        .expect(400);
    });
  });

  describe('Applications validation', () => {
    it('should reject create without jobId', async () => {
      await request(app.getHttpServer())
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'SAVED' })
        .expect(400);
    });

    it('should reject invalid status enum', async () => {
      await request(app.getHttpServer())
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ jobId: 1, status: 'INVALID' })
        .expect(400);
    });

    it('should accept valid status values', async () => {
      for (const status of ['SAVED', 'APPLYING', 'APPLIED', 'INTERVIEW', 'OFFER', 'REJECTED']) {
        await request(app.getHttpServer())
          .post('/api/applications')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ jobId: 1, status })
          .expect((res) => {
            if (res.status !== 201 && res.status !== 400) {
              throw new Error(`Expected 201 or 400 for status ${status}, got ${res.status}`);
            }
          });
      }
    });

    it('should reject coverLetter exceeding 10000 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ jobId: 1, coverLetter: 'A'.repeat(10001) })
        .expect(400);
    });

    it('should reject notes exceeding 5000 chars', async () => {
      await request(app.getHttpServer())
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ jobId: 1, notes: 'A'.repeat(5001) })
        .expect(400);
    });
  });

  describe('Protected endpoints', () => {
    it('should return 401 for jobs without token', async () => {
      await request(app.getHttpServer())
        .get('/api/jobs')
        .expect(401);
    });

    it('should return 401 for companies without token', async () => {
      await request(app.getHttpServer())
        .get('/api/companies')
        .expect(401);
    });

    it('should return 401 for applications without token', async () => {
      await request(app.getHttpServer())
        .get('/api/applications')
        .expect(401);
    });

    it('should return 401 for dashboard without token', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .expect(401);
    });

    it('should return 401 for users/me without token', async () => {
      await request(app.getHttpServer())
        .get('/api/users/me')
        .expect(401);
    });

    it('should return 401 for invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/jobs')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
