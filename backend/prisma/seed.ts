import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('admin123', 12);

  const user = await prisma.user.upsert({
    where: { email: 'demo@jobtrack.dev' },
    update: {},
    create: {
      email: 'demo@jobtrack.dev',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  console.log(`Created user: ${user.email}`);

  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'Acme Corp',
        website: 'https://acme.com',
        industry: 'Technology',
        location: 'San Francisco, CA',
      },
    }),
    prisma.company.create({
      data: {
        name: 'TechStart Inc',
        website: 'https://techstart.com',
        industry: 'SaaS',
        location: 'Remote',
      },
    }),
  ]);

  console.log(`Created ${companies.length} companies`);

  const jobs = await Promise.all([
    prisma.job.create({
      data: {
        title: 'Senior Software Engineer',
        companyId: companies[0].id,
        location: 'San Francisco, CA',
        salary: 180000,
        workType: 'HYBRID',
        source: 'LinkedIn',
        url: 'https://linkedin.com/jobs/123',
        description: 'Looking for a senior engineer to join our team.',
      },
    }),
    prisma.job.create({
      data: {
        title: 'Full Stack Developer',
        companyId: companies[1].id,
        location: 'Remote',
        salary: 150000,
        workType: 'REMOTE',
        source: 'Indeed',
        url: 'https://indeed.com/jobs/456',
        description: 'Full stack role with React and Node.js.',
      },
    }),
  ]);

  console.log(`Created ${jobs.length} jobs`);

  const applications = await Promise.all([
    prisma.application.create({
      data: {
        jobId: jobs[0].id,
        status: 'APPLIED',
        appliedDate: new Date('2024-01-15'),
        cvVersion: 'CV_v2.pdf',
        userId: user.id,
      },
    }),
    prisma.application.create({
      data: {
        jobId: jobs[1].id,
        status: 'INTERVIEW',
        appliedDate: new Date('2024-01-10'),
        notes: 'Phone screen scheduled for next week.',
        userId: user.id,
      },
    }),
  ]);

  console.log(`Created ${applications.length} applications`);
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
