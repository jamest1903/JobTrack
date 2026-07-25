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
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { ApplicationStatus } from '@prisma/client';
import { Request } from 'express';

@ApiTags('applications')
@Controller('applications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new application' })
  async create(@Req() req: Request, @Body() createApplicationDto: CreateApplicationDto) {
    const userId = (req.user as any)?.sub;
    return this.applicationsService.create(userId, createApplicationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all applications' })
  @ApiQuery({ name: 'status', required: false, enum: ApplicationStatus })
  async findAll(@Req() req: Request, @Query('status') status?: ApplicationStatus) {
    const userId = (req.user as any)?.sub;
    return this.applicationsService.findAll(userId, status);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get application by ID' })
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const userId = (req.user as any)?.sub;
    return this.applicationsService.findOne(userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update application' })
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApplicationDto: UpdateApplicationDto,
  ) {
    const userId = (req.user as any)?.sub;
    return this.applicationsService.update(userId, id, updateApplicationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete application' })
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const userId = (req.user as any)?.sub;
    return this.applicationsService.remove(userId, id);
  }
}
