import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, closeApp, generateAccessToken, setupUserMock } from './test-setup';
import { createMockApplication } from './prisma-mock';

describe('Applications (e2e)', () => {
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

  describe('POST /api/applications', () => {
    it('should create an application', async () => {
      const mockApp = createMockApplication();
      prismaMock.application.create.mockResolvedValue(mockApp);

      const response = await request(app.getHttpServer())
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ jobId: 1 })
        .expect(201);

      expect(response.body).toEqual(mockApp);
    });

    it('should create an application with optional fields', async () => {
      const mockApp = createMockApplication({ status: 'APPLIED', appliedDate: '2024-01-15' });
      prismaMock.application.create.mockResolvedValue(mockApp);

      const response = await request(app.getHttpServer())
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          jobId: 1,
          status: 'APPLIED',
          appliedDate: '2024-01-15',
          cvVersion: 'CV_v2.pdf',
          notes: 'Follow up next week',
        })
        .expect(201);

      expect(response.body.status).toBe('APPLIED');
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/api/applications')
        .send({ jobId: 1 })
        .expect(401);
    });

    it('should return 400 without required jobId', async () => {
      await request(app.getHttpServer())
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'SAVED' })
        .expect(400);
    });

    it('should return 400 for invalid status enum', async () => {
      await request(app.getHttpServer())
        .post('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ jobId: 1, status: 'INVALID_STATUS' })
        .expect(400);
    });
  });

  describe('GET /api/applications', () => {
    it('should return all applications', async () => {
      const mockApps = [
        createMockApplication(),
        createMockApplication({ id: 2, jobId: 2 }),
      ];
      prismaMock.application.findMany.mockResolvedValue(mockApps);

      const response = await request(app.getHttpServer())
        .get('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should return empty array when no applications', async () => {
      prismaMock.application.findMany.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/api/applications')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should filter by status when provided', async () => {
      const mockApps = [createMockApplication({ status: 'APPLIED' })];
      prismaMock.application.findMany.mockResolvedValue(mockApps);

      await request(app.getHttpServer())
        .get('/api/applications?status=APPLIED')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(prismaMock.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'APPLIED' }),
        }),
      );
    });
  });

  describe('GET /api/applications/:id', () => {
    it('should return an application by id', async () => {
      const mockApp = createMockApplication();
      prismaMock.application.findFirst.mockResolvedValue(mockApp);

      const response = await request(app.getHttpServer())
        .get('/api/applications/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual(mockApp);
    });

    it('should return 404 for non-existent application', async () => {
      prismaMock.application.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/api/applications/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PUT /api/applications/:id', () => {
    it('should update an application', async () => {
      const mockApp = createMockApplication();
      const updatedApp = { ...mockApp, status: 'INTERVIEW' };
      prismaMock.application.findFirst.mockResolvedValue(mockApp);
      prismaMock.application.update.mockResolvedValue(updatedApp);

      const response = await request(app.getHttpServer())
        .put('/api/applications/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'INTERVIEW' })
        .expect(200);

      expect(response.body).toEqual(updatedApp);
    });

    it('should return 404 when updating non-existent application', async () => {
      prismaMock.application.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .put('/api/applications/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'OFFER' })
        .expect(404);
    });
  });

  describe('DELETE /api/applications/:id', () => {
    it('should delete an application', async () => {
      const mockApp = createMockApplication();
      prismaMock.application.findFirst.mockResolvedValue(mockApp);
      prismaMock.application.delete.mockResolvedValue(mockApp);

      const response = await request(app.getHttpServer())
        .delete('/api/applications/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual(mockApp);
    });

    it('should return 404 when deleting non-existent application', async () => {
      prismaMock.application.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/api/applications/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
