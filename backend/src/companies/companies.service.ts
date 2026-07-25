import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createCompanyDto: CreateCompanyDto) {
    return this.prisma.company.create({
      data: {
        ...createCompanyDto,
        userId,
      },
    });
  }

  async findAll(userId: number) {
    return this.prisma.company.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: number, id: number) {
    const company = await this.prisma.company.findFirst({
      where: { id, userId },
    });
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    return company;
  }

  async update(userId: number, id: number, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(userId, id);
    return this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.company.delete({
      where: { id },
    });
  }
}
