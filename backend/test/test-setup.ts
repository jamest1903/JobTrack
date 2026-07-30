import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaService } from '../src/prisma/prisma.service';
import { PrismaModule } from '../src/prisma/prisma.module';
import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { CompaniesModule } from '../src/companies/companies.module';
import { JobsModule } from '../src/jobs/jobs.module';
import { ApplicationsModule } from '../src/applications/applications.module';
import { DashboardModule } from '../src/dashboard/dashboard.module';

const TEST_JWT_SECRET = 'test-jwt-secret';
const TEST_JWT_REFRESH_SECRET = 'test-jwt-refresh-secret';

export function createPrismaMock() {
  return {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    company: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    job: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    application: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn(),
  } as unknown as PrismaService;
}

export async function createTestApp(): Promise<{
  app: INestApplication;
  prismaMock: ReturnType<typeof createPrismaMock>;
  jwtService: JwtService;
}> {
  const prismaMock = createPrismaMock();

  setupUserMock(prismaMock);

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [() => ({
          JWT_SECRET: TEST_JWT_SECRET,
          JWT_REFRESH_SECRET: TEST_JWT_REFRESH_SECRET,
          JWT_EXPIRATION: '15m',
          JWT_REFRESH_EXPIRATION: '7d',
        })],
      }),
      PassportModule,
      JwtModule.register({
        secret: TEST_JWT_SECRET,
        signOptions: { expiresIn: '15m' },
      }),
      PrismaModule,
      AuthModule,
      UsersModule,
      CompaniesModule,
      JobsModule,
      ApplicationsModule,
      DashboardModule,
    ],
  })
    .overrideProvider(PrismaService)
    .useValue(prismaMock)
    .compile();

  const app = moduleFixture.createNestApplication();

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('JobTrack API')
    .setDescription('JobTrack job application management API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();

  (app as any).__prismaMock = prismaMock;

  const jwtService = moduleFixture.get(JwtService);

  return { app, prismaMock, jwtService };
}

export function generateAccessToken(jwtService: JwtService, payload: { sub: number; email: string }): string {
  return jwtService.sign(payload);
}

export async function closeApp(app: INestApplication) {
  await app.close();
}

export function setupUserMock(prismaMock: ReturnType<typeof createPrismaMock>) {
  (prismaMock.user.findUnique as jest.Mock).mockResolvedValue({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: 'hashedpassword',
    refreshToken: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}
