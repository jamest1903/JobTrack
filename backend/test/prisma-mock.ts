import { PrismaService } from '../src/prisma/prisma.service';

type PrismaMock = {
  [K in keyof PrismaService]: PrismaService[K] extends (...args: any[]) => any
    ? jest.Mock
    : PrismaService[K];
};

export function createPrismaMock(): PrismaMock {
  const mock: any = {};

  const methods = [
    'create',
    'findMany',
    'findFirst',
    'findUnique',
    'update',
    'delete',
    'upsert',
    'count',
    'aggregate',
    '$connect',
    '$disconnect',
    '$transaction',
  ];

  for (const method of methods) {
    mock[method] = jest.fn();
  }

  return mock;
}

export function createMockUser(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    refreshToken: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockCompany(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    name: 'Acme Corp',
    website: 'https://acme.com',
    industry: 'Technology',
    location: 'San Francisco, CA',
    notes: null,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockJob(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    title: 'Senior Software Engineer',
    location: 'San Francisco, CA',
    salary: 150000,
    workType: 'REMOTE',
    source: 'LinkedIn',
    url: 'https://linkedin.com/jobs/123',
    description: 'A great job',
    companyId: 1,
    dateFound: '2024-01-01T00:00:00.000Z',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

export function createMockApplication(overrides: Record<string, any> = {}) {
  return {
    id: 1,
    status: 'SAVED',
    appliedDate: null,
    cvVersion: null,
    coverLetter: null,
    notes: null,
    userId: 1,
    jobId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}
