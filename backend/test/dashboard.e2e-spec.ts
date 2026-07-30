import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, closeApp, generateAccessToken, setupUserMock } from './test-setup';
import { createMockApplication, createMockJob, createMockCompany } from './prisma-mock';

describe('Dashboard (e2e)', () => {
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

  describe('GET /api/dashboard/stats', () => {
    it('should return dashboard statistics', async () => {
      prismaMock.application.count
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(2)  // saved
        .mockResolvedValueOnce(1)  // applying
        .mockResolvedValueOnce(3)  // applied
        .mockResolvedValueOnce(2)  // interview
        .mockResolvedValueOnce(1)  // offer
        .mockResolvedValueOnce(1); // rejected

      const response = await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalApplications');
      expect(response.body).toHaveProperty('byStatus');
      expect(response.body).toHaveProperty('responseRate');
      expect(response.body.totalApplications).toBe(10);
      expect(response.body.byStatus).toEqual({
        saved: 2,
        applying: 1,
        applied: 3,
        interview: 2,
        offer: 1,
        rejected: 1,
      });
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/stats')
        .expect(401);
    });
  });

  describe('GET /api/dashboard/recent', () => {
    it('should return recent activity', async () => {
      const mockApps = [
        {
          ...createMockApplication(),
          job: { ...createMockJob(), company: createMockCompany() },
        },
      ];
      prismaMock.application.findMany.mockResolvedValue(mockApps);

      const response = await request(app.getHttpServer())
        .get('/api/dashboard/recent')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toHaveProperty('job');
    });

    it('should respect limit parameter', async () => {
      prismaMock.application.findMany.mockResolvedValue([]);

      await request(app.getHttpServer())
        .get('/api/dashboard/recent?limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(prismaMock.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/api/dashboard/recent')
        .expect(401);
    });
  });
});
