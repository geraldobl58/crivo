import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { PlanType, SubscriptionStatus } from '@prisma/client';

export class ListCompaniesQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nome da empresa',
    example: 'Empresa',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por status da assinatura',
    example: 'ACTIVE',
    enum: [
      'TRIALING',
      'ACTIVE',
      'PAST_DUE',
      'CANCELED',
      'EXPIRED',
      'INCOMPLETE',
      'PENDING_PAYMENT',
    ],
  })
  @IsString()
  @IsOptional()
  status?: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de plano',
    example: 'PROFESSIONAL',
    enum: ['TRIAL', 'BASIC', 'PROFESSIONAL', 'ENTERPRISE'],
  })
  @IsString()
  @IsOptional()
  planType?: PlanType;

  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Itens por página',
    example: 20,
    default: 20,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number;
}
