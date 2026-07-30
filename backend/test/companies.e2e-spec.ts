import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createTestApp, closeApp, generateAccessToken, setupUserMock } from './test-setup';
import { createMockCompany } from './prisma-mock';

describe('Companies (e2e)', () => {
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

  describe('POST /api/companies', () => {
    it('should create a company', async () => {
      const mockCompany = createMockCompany();
      prismaMock.company.create.mockResolvedValue(mockCompany);

      const response = await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme Corp', website: 'https://acme.com' })
        .expect(201);

      expect(response.body).toEqual(mockCompany);
    });

    it('should create a company with minimal data', async () => {
      const mockCompany = createMockCompany({ website: null, industry: null, location: null, notes: null });
      prismaMock.company.create.mockResolvedValue(mockCompany);

      const response = await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme Corp' })
        .expect(201);

      expect(response.body.name).toBe('Acme Corp');
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .send({ name: 'Acme Corp' })
        .expect(401);
    });

    it('should return 400 without required name', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ website: 'https://acme.com' })
        .expect(400);
    });

    it('should return 400 for invalid website URL', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme', website: 'not-a-url' })
        .expect(400);
    });

    it('should return 400 for extra fields (whitelist)', async () => {
      await request(app.getHttpServer())
        .post('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Acme', extraField: 'should fail' })
        .expect(400);
    });
  });

  describe('GET /api/companies', () => {
    it('should return all companies', async () => {
      const mockCompanies = [
        createMockCompany(),
        createMockCompany({ id: 2, name: 'TechStart' }),
      ];
      prismaMock.company.findMany.mockResolvedValue(mockCompanies);

      const response = await request(app.getHttpServer())
        .get('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body).toEqual(mockCompanies);
    });

    it('should return empty array when no companies', async () => {
      prismaMock.company.findMany.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/api/companies')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/companies/:id', () => {
    it('should return a company by id', async () => {
      const mockCompany = createMockCompany();
      prismaMock.company.findFirst.mockResolvedValue(mockCompany);

      const response = await request(app.getHttpServer())
        .get('/api/companies/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual(mockCompany);
    });

    it('should return 404 for non-existent company', async () => {
      prismaMock.company.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/api/companies/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .get('/api/companies/abc')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('PUT /api/companies/:id', () => {
    it('should update a company', async () => {
      const mockCompany = createMockCompany();
      const updatedCompany = { ...mockCompany, name: 'Updated Corp' };
      prismaMock.company.findFirst.mockResolvedValue(mockCompany);
      prismaMock.company.update.mockResolvedValue(updatedCompany);

      const response = await request(app.getHttpServer())
        .put('/api/companies/1')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated Corp' })
        .expect(200);

      expect(response.body).toEqual(updatedCompany);
    });

    it('should return 404 when updating non-existent company', async () => {
      prismaMock.company.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .put('/api/companies/999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Updated' })
        .expect(404);
    });
  });

  describe('DELETE /api/companies/:id', () => {
    it('should delete a company', async () => {
      const mockCompany = createMockCompany();
      prismaMock.company.findFirst.mockResolvedValue(mockCompany);
      prismaMock.company.delete.mockResolvedValue(mockCompany);

      const response = await request(app.getHttpServer())
        .delete('/api/companies/1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual(mockCompany);
    });

    it('should return 404 when deleting non-existent company', async () => {
      prismaMock.company.findFirst.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/api/companies/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
