import { PartialType } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTransactionDto } from './create-transaction.dto';

export class UpdateTransactionDto extends PartialType(CreateTransactionDto) {
  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isExcludedFromBudget?: boolean;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isExcludedFromReports?: boolean;
}
