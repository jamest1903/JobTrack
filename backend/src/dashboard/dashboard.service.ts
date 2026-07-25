import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(userId: number) {
    const [
      totalApplications,
      savedCount,
      applyingCount,
      appliedCount,
      interviewCount,
      offerCount,
      rejectedCount,
    ] = await Promise.all([
      this.prisma.application.count({ where: { userId } }),
      this.prisma.application.count({ where: { userId, status: ApplicationStatus.SAVED } }),
      this.prisma.application.count({ where: { userId, status: ApplicationStatus.APPLYING } }),
      this.prisma.application.count({ where: { userId, status: ApplicationStatus.APPLIED } }),
      this.prisma.application.count({ where: { userId, status: ApplicationStatus.INTERVIEW } }),
      this.prisma.application.count({ where: { userId, status: ApplicationStatus.OFFER } }),
      this.prisma.application.count({ where: { userId, status: ApplicationStatus.REJECTED } }),
    ]);

    const responseRate =
      appliedCount > 0
        ? ((interviewCount + offerCount) / appliedCount) * 100
        : 0;

    return {
      totalApplications,
      byStatus: {
        saved: savedCount,
        applying: applyingCount,
        applied: appliedCount,
        interview: interviewCount,
        offer: offerCount,
        rejected: rejectedCount,
      },
      responseRate: Math.round(responseRate * 100) / 100,
    };
  }

  async getRecentActivity(userId: number, limit = 10) {
    const recentApplications = await this.prisma.application.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });

    return recentApplications;
  }
}
