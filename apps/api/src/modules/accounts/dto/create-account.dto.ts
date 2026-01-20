import {
  IsString,
  IsNumber,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  officialName?: string;

  @ApiProperty({ enum: AccountType })
  @IsEnum(AccountType)
  type: AccountType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  subtype?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  mask?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  institutionName?: string;

  @ApiProperty()
  @IsNumber()
  currentBalance: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  availableBalance?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  creditLimit?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  currency?: string;
}
