import {
  IsString,
  IsOptional,
  IsDate,
  IsNumber,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RiskTolerance } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(18)
  @Max(100)
  retirementAge?: number;

  @ApiPropertyOptional({ enum: RiskTolerance })
  @IsEnum(RiskTolerance)
  @IsOptional()
  riskTolerance?: RiskTolerance;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  annualIncome?: number;
}
