import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Request } from 'express';

@ApiTags('companies')
@Controller('companies')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new company' })
  async create(@Req() req: Request, @Body() createCompanyDto: CreateCompanyDto) {
    const userId = (req.user as any)?.sub;
    return this.companiesService.create(userId, createCompanyDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all companies' })
  async findAll(@Req() req: Request) {
    const userId = (req.user as any)?.sub;
    return this.companiesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get company by ID' })
  async findOne(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const userId = (req.user as any)?.sub;
    return this.companiesService.findOne(userId, id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update company' })
  async update(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    const userId = (req.user as any)?.sub;
    return this.companiesService.update(userId, id, updateCompanyDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete company' })
  async remove(@Req() req: Request, @Param('id', ParseIntPipe) id: number) {
    const userId = (req.user as any)?.sub;
    return this.companiesService.remove(userId, id);
  }
}
