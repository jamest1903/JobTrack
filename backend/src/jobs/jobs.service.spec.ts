import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { createMockJob } from '../../test/prisma-mock';

describe('JobsService', () => {
  let service: JobsService;
  let prismaMock: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prismaMock = {
      job: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [JobsService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    service = module.get(JobsService);
  });

  describe('create', () => {
    it('should create a job', async () => {
      const dto = { title: 'Software Engineer', companyId: 1 };
      const mockJob = createMockJob();
      prismaMock.job.create.mockResolvedValue(mockJob);

      const result = await service.create(dto);

      expect(result).toEqual(mockJob);
      expect(prismaMock.job.create).toHaveBeenCalledWith({
        data: { ...dto, companyId: dto.companyId },
      });
    });

    it('should create a job without companyId', async () => {
      const dto = { title: 'Software Engineer' };
      const mockJob = createMockJob({ companyId: null });
      prismaMock.job.create.mockResolvedValue(mockJob);

      const result = await service.create(dto);

      expect(result).toEqual(mockJob);
    });
  });

  describe('findAll', () => {
    it('should return all jobs with company included', async () => {
      const mockJobs = [
        createMockJob(),
        createMockJob({ id: 2, title: 'Full Stack Developer' }),
      ];
      prismaMock.job.findMany.mockResolvedValue(mockJobs);

      const result = await service.findAll();

      expect(result).toEqual(mockJobs);
      expect(prismaMock.job.findMany).toHaveBeenCalledWith({
        include: { company: true },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no jobs exist', async () => {
      prismaMock.job.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a job by id', async () => {
      const mockJob = createMockJob();
      prismaMock.job.findFirst.mockResolvedValue(mockJob);

      const result = await service.findOne(1);

      expect(result).toEqual(mockJob);
    });

    it('should throw NotFoundException if job not found', async () => {
      prismaMock.job.findFirst.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a job', async () => {
      const mockJob = createMockJob();
      const updatedJob = { ...mockJob, title: 'Senior Engineer' };
      prismaMock.job.findFirst.mockResolvedValue(mockJob);
      prismaMock.job.update.mockResolvedValue(updatedJob);

      const result = await service.update(1, { title: 'Senior Engineer' });

      expect(result).toEqual(updatedJob);
    });

    it('should throw NotFoundException if job not found', async () => {
      prismaMock.job.findFirst.mockResolvedValue(null);

      await expect(service.update(999, { title: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a job', async () => {
      const mockJob = createMockJob();
      prismaMock.job.findFirst.mockResolvedValue(mockJob);
      prismaMock.job.delete.mockResolvedValue(mockJob);

      const result = await service.remove(1);

      expect(result).toEqual(mockJob);
    });

    it('should throw NotFoundException if job not found', async () => {
      prismaMock.job.findFirst.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
