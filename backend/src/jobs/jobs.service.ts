import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createJobDto: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        ...createJobDto,
        userId,
        companyId: createJobDto.companyId,
      },
    });
  }

  async findAll(userId: number, status?: JobStatus) {
    return this.prisma.job.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        company: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const job = await this.prisma.job.findFirst({
      where: { id, userId },
      include: {
        company: true,
      },
    });
    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }
    return job;
  }

  async update(userId: number, id: number, updateJobDto: UpdateJobDto) {
    await this.findOne(userId, id);
    return this.prisma.job.update({
      where: { id },
      data: updateJobDto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.job.delete({
      where: { id },
    });
  }
}
