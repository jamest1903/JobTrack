import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';
import { createMockCompany } from '../../test/prisma-mock';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prismaMock: Record<string, Record<string, jest.Mock>>;

  beforeEach(async () => {
    prismaMock = {
      company: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [CompaniesService],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .compile();

    service = module.get(CompaniesService);
  });

  describe('create', () => {
    it('should create a company', async () => {
      const dto = { name: 'Acme Corp', website: 'https://acme.com' };
      const mockCompany = createMockCompany();
      prismaMock.company.create.mockResolvedValue(mockCompany);

      const result = await service.create(dto);

      expect(result).toEqual(mockCompany);
      expect(prismaMock.company.create).toHaveBeenCalledWith({ data: dto });
    });
  });

  describe('findAll', () => {
    it('should return all companies', async () => {
      const mockCompanies = [createMockCompany(), createMockCompany({ id: 2, name: 'TechStart' })];
      prismaMock.company.findMany.mockResolvedValue(mockCompanies);

      const result = await service.findAll();

      expect(result).toEqual(mockCompanies);
      expect(prismaMock.company.findMany).toHaveBeenCalledWith({ orderBy: { name: 'asc' } });
    });

    it('should return empty array when no companies exist', async () => {
      prismaMock.company.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a company by id', async () => {
      const mockCompany = createMockCompany();
      prismaMock.company.findFirst.mockResolvedValue(mockCompany);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException if company not found', async () => {
      prismaMock.company.findFirst.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a company', async () => {
      const mockCompany = createMockCompany();
      const updatedCompany = { ...mockCompany, name: 'Updated Corp' };
      prismaMock.company.findFirst.mockResolvedValue(mockCompany);
      prismaMock.company.update.mockResolvedValue(updatedCompany);

      const result = await service.update(1, { name: 'Updated Corp' });

      expect(result).toEqual(updatedCompany);
    });

    it('should throw NotFoundException if company not found', async () => {
      prismaMock.company.findFirst.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a company', async () => {
      const mockCompany = createMockCompany();
      prismaMock.company.findFirst.mockResolvedValue(mockCompany);
      prismaMock.company.delete.mockResolvedValue(mockCompany);

      const result = await service.remove(1);

      expect(result).toEqual(mockCompany);
    });

    it('should throw NotFoundException if company not found', async () => {
      prismaMock.company.findFirst.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
