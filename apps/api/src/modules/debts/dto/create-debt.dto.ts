import {
  IsString,
  IsNumber,
  IsDate,
  IsOptional,
  IsEnum,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DebtType } from '@prisma/client';

export class CreateDebtDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: DebtType })
  @IsEnum(DebtType)
  type: DebtType;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  originalAmount: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  currentBalance: number;

  @ApiProperty({ description: 'Annual interest rate as decimal (e.g., 0.185 for 18.5%)' })
  @IsNumber()
  @Min(0)
  @Max(1)
  interestRate: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  minimumPayment: number;

  @ApiProperty({ description: 'Day of month when payment is due (1-31)' })
  @IsNumber()
  @Min(1)
  @Max(31)
  dueDay: number;

  @ApiPropertyOptional()
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  lender?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  linkedAccountId?: string;
}
