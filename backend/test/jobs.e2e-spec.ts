import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, closeApp, generateAccessToken, setupUserMock } from './test-setup';
import { createMockJob } from './prisma-mock';

describe('Jobs (e2e)', () => {
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

  describe('POST /api/jobs', () => {
    it('should create a job', async () => {
      const mockJob = createMockJob();
      prismaMock.job.create.mockResolvedValue(mockJob);

      const response = await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Senior Software Engineer', companyId: 1 })
        .expect(201);

      expect(response.body).toEqual(mockJob);
    });

    it('should create a job with all optional fields', async () => {
      const mockJob = createMockJob();
      prismaMock.job.create.mockResolvedValue(mockJob);

      const response = await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Senior Software Engineer',
          companyId: 1,
          location: 'San Francisco, CA',
          salary: 150000,
          workType: 'REMOTE',
          source: 'LinkedIn',
          url: 'https://linkedin.com/jobs/123',
          description: 'A great job',
        })
        .expect(201);

      expect(response.body.title).toBe('Senior Software Engineer');
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .send({ title: 'Software Engineer' })
        .expect(401);
    });

    it('should return 400 without required title', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ companyId: 1 })
        .expect(400);
    });

    it('should return 400 for invalid workType enum', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Engineer', workType: 'INVALID' })
        .expect(400);
    });

    it('should return 400 for invalid URL', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Engineer', url: 'not-a-url' })
        .expect(400);
    });

    it('should return 400 for negative salary', async () => {
      await request(app.getHttpServer())
        .post('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Engineer', salary: -100 })
        .expect(400);
    });
  });

  describe('GET /api/jobs', () => {
    it('should return all jobs', async () => {
      const mockJobs = [
        createMockJob(),
        createMockJob({ id: 2, title: 'Full Stack Developer' }),
      ];
      prismaMock.job.findMany.mockResolvedValue(mockJobs);

      const response = await request(app.getHttpServer())
        .get('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(mockJobs);
    });

    it('should return empty array when no jobs', async () => {
      prismaMock.job.findMany.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/api/jobs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/jobs/:id', () => {
    it('should return a job by id', async () => {
      const mockJob = createMockJob();
      prismaMock.job.findFirst.mockResolvedValue(mockJob);

      const response = await request(app.getHttpServer())
        .get('/api/jobs/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual(mockJob);
    });

    it('should return 404 for non-existent job', async () => {
      prismaMock.job.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/api/jobs/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .get('/api/jobs/abc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/jobs/:id', () => {
    it('should update a job', async () => {
      const mockJob = createMockJob();
      const updatedJob = { ...mockJob, title: 'Senior Engineer' };
      prismaMock.job.findFirst.mockResolvedValue(mockJob);
      prismaMock.job.update.mockResolvedValue(updatedJob);

      const response = await request(app.getHttpServer())
        .put('/api/jobs/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Senior Engineer' })
        .expect(200);

      expect(response.body).toEqual(updatedJob);
    });

    it('should return 404 when updating non-existent job', async () => {
      prismaMock.job.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .put('/api/jobs/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/jobs/:id', () => {
    it('should delete a job', async () => {
      const mockJob = createMockJob();
      prismaMock.job.findFirst.mockResolvedValue(mockJob);
      prismaMock.job.delete.mockResolvedValue(mockJob);

      const response = await request(app.getHttpServer())
        .delete('/api/jobs/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual(mockJob);
    });

    it('should return 404 when deleting non-existent job', async () => {
      prismaMock.job.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/api/jobs/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
