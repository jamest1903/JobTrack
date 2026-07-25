import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: number, createApplicationDto: CreateApplicationDto) {
    return this.prisma.application.create({
      data: {
        ...createApplicationDto,
        userId,
      },
    });
  }

  async findAll(userId: number, status?: ApplicationStatus) {
    return this.prisma.application.findMany({
      where: {
        userId,
        ...(status && { status }),
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: number, id: number) {
    const application = await this.prisma.application.findFirst({
      where: { id, userId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });
    if (!application) {
      throw new NotFoundException(`Application with ID ${id} not found`);
    }
    return application;
  }

  async update(userId: number, id: number, updateApplicationDto: UpdateApplicationDto) {
    await this.findOne(userId, id);
    return this.prisma.application.update({
      where: { id },
      data: updateApplicationDto,
    });
  }

  async remove(userId: number, id: number) {
    await this.findOne(userId, id);
    return this.prisma.application.delete({
      where: { id },
    });
  }
}
