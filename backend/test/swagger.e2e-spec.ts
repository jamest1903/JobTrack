import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { createTestApp, closeApp } from './test-setup';

describe('Swagger (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const setup = await createTestApp();
    app = setup.app;
  });

  afterAll(async () => {
    await closeApp(app);
  });

  describe('GET /api/docs', () => {
    it('should serve Swagger UI', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs')
        .expect(200);

      expect(response.text).toContain('swagger');
    });
  });

  describe('GET /api/docs-json', () => {
    it('should serve Swagger JSON document', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200);

      const spec = response.body;
      expect(spec).toHaveProperty('openapi');
      expect(spec).toHaveProperty('paths');
      expect(spec).toHaveProperty('components');

      expect(spec.info.title).toBe('JobTrack API');
      expect(spec.info.version).toBe('0.1.0');

      expect(spec.paths).toHaveProperty('/api/auth/register');
      expect(spec.paths).toHaveProperty('/api/auth/login');
      expect(spec.paths).toHaveProperty('/api/auth/logout');
      expect(spec.paths).toHaveProperty('/api/users/me');
      expect(spec.paths).toHaveProperty('/api/companies');
      expect(spec.paths).toHaveProperty('/api/companies/{id}');
      expect(spec.paths).toHaveProperty('/api/jobs');
      expect(spec.paths).toHaveProperty('/api/jobs/{id}');
      expect(spec.paths).toHaveProperty('/api/applications');
      expect(spec.paths).toHaveProperty('/api/applications/{id}');
      expect(spec.paths).toHaveProperty('/api/dashboard/stats');
      expect(spec.paths).toHaveProperty('/api/dashboard/recent');
    });

    it('should document auth endpoints', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200);

      const spec = response.body;

      const registerOp = spec.paths['/api/auth/register'].post;
      expect(registerOp.summary).toBe('Register a new user');

      const loginOp = spec.paths['/api/auth/login'].post;
      expect(loginOp.summary).toBe('Login with email and password');
    });

    it('should document job endpoints with correct methods', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200);

      const spec = response.body;

      expect(spec.paths['/api/jobs']).toHaveProperty('get');
      expect(spec.paths['/api/jobs']).toHaveProperty('post');
      expect(spec.paths['/api/jobs/{id}']).toHaveProperty('get');
      expect(spec.paths['/api/jobs/{id}']).toHaveProperty('put');
      expect(spec.paths['/api/jobs/{id}']).toHaveProperty('delete');
    });

    it('should document security scheme for Bearer auth', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/docs-json')
        .expect(200);

      const spec = response.body;
      expect(spec.components.securitySchemes).toHaveProperty('bearer');
    });
  });
});
