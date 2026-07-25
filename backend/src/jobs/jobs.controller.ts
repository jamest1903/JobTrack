import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobStatus } from '@prisma/client';
import { Request } from 'express';

@ApiTags('jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  async create(@Req() req: Request, @Body() createJobDto: CreateJobDto) {
    const userId = (req.user as any)?.sub;
    return this.jobsService.create(userId, createJobDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all jobs' })
  @ApiQuery({ name: 'status', required: false, enum: JobStatus })
  async findAll(@Req() req: Request, @Query('status') status?: JobStatus) {
    const userId = (req.user as any)?.sub;
    return this.jobsService.findAll(userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const userId = (req.user as any)?.sub;
    return this.jobsService.findOne(userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update job' })
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    const userId = (req.user as any)?.sub;
    return this.jobsService.update(userId, id, updateJobDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete job' })
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const userId = (req.user as any)?.sub;
    return this.jobsService.remove(userId, id);
  }
}
