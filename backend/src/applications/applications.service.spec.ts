import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { createMockApplication } from '../../test/prisma-mock';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let prismaMock: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prismaMock = {
      application: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [ApplicationsService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    service = module.get(ApplicationsService);
  });

  describe('create', () => {
    it('should create an application with userId', async () => {
      const dto = { jobId: 1, status: 'SAVED' as const };
      const mockApp = createMockApplication();
      prismaMock.application.create.mockResolvedValue(mockApp);

      const result = await service.create(1, dto);

      expect(result).toEqual(mockApp);
      expect(prismaMock.application.create).toHaveBeenCalledWith({
        data: { ...dto, userId: 1 },
      });
    });
  });

  describe('findAll', () => {
    it('should return all applications for a user', async () => {
      const mockApps = [createMockApplication(), createMockApplication({ id: 2 })];
      prismaMock.application.findMany.mockResolvedValue(mockApps);

      const result = await service.findAll(1);

      expect(result).toEqual(mockApps);
      expect(prismaMock.application.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        include: { job: { include: { company: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by status when provided', async () => {
      const mockApps = [createMockApplication({ status: 'APPLIED' })];
      prismaMock.application.findMany.mockResolvedValue(mockApps);

      await service.findAll(1, 'APPLIED');

      expect(prismaMock.application.findMany).toHaveBeenCalledWith({
        where: { userId: 1, status: 'APPLIED' },
        include: { job: { include: { company: true } } },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return an application by id', async () => {
      const mockApp = createMockApplication();
      prismaMock.application.findFirst.mockResolvedValue(mockApp);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockApp);
    });

    it('should throw NotFoundException if application not found', async () => {
      prismaMock.application.findFirst.mockResolvedValue(null);

      await expect(service.findOne(1, 999)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if application belongs to different user', async () => {
      prismaMock.application.findFirst.mockResolvedValue(null);

      await expect(service.findOne(2, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update an application', async () => {
      const mockApp = createMockApplication();
      const updatedApp = { ...mockApp, status: 'APPLIED' };
      prismaMock.application.findFirst.mockResolvedValue(mockApp);
      prismaMock.application.update.mockResolvedValue(updatedApp);

      const result = await service.update(1, 1, { status: 'APPLIED' });

      expect(result).toEqual(updatedApp);
    });

    it('should throw NotFoundException if application not found', async () => {
      prismaMock.application.findFirst.mockResolvedValue(null);

      await expect(service.update(1, 999, { status: 'APPLIED' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an application', async () => {
      const mockApp = createMockApplication();
      prismaMock.application.findFirst.mockResolvedValue(mockApp);
      prismaMock.application.delete.mockResolvedValue(mockApp);

      const result = await service.remove(1, 1);

      expect(result).toEqual(mockApp);
    });

    it('should throw NotFoundException if application not found', async () => {
      prismaMock.application.findFirst.mockResolvedValue(null);

      await expect(service.remove(1, 999)).rejects.toThrow(NotFoundException);
    });
  });
});
