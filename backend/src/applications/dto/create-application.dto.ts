import { IsString, IsOptional, IsNumber, IsEnum, IsUrl, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApplicationStatus } from '@prisma/client';

export class CreateApplicationDto {
  @ApiProperty()
  @IsNumber()
  jobId: number;

  @ApiPropertyOptional({ enum: ApplicationStatus, default: ApplicationStatus.SAVED })
  @IsOptional()
  @IsEnum(ApplicationStatus)
  status?: ApplicationStatus;

  @ApiPropertyOptional({ example: '2024-01-15' })
  @IsOptional()
  @IsString()
  appliedDate?: string;

  @ApiPropertyOptional({ example: 'CV_v2.pdf' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  cvVersion?: string;

  @ApiPropertyOptional({ example: 'Cover letter text...' })
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  coverLetter?: string;

  @ApiPropertyOptional({ example: 'Follow up next week' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  notes?: string;
}
