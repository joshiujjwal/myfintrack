import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsArray,
  IsEnum,
  IsObject,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GoalType } from '@prisma/client';

export class CreateGoalDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: GoalType })
  @IsEnum(GoalType)
  type: GoalType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  targetAmount: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  currentAmount?: number;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiProperty()
  @IsDate()
  @Type(() => Date)
  targetDate: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  priority?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  linkedAccountIds?: string[];

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  monthlyContribution?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  expectedReturn?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  inflationRate?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  color?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  settings?: Record<string, unknown>;
}
