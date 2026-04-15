import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({
    description: 'Tipo do plano',
    enum: PlanType,
    example: 'BASIC',
  })
  @IsEnum(PlanType)
  @IsNotEmpty()
  type: PlanType;

  @ApiProperty({
    description: 'Nome do plano',
    example: 'Crivo Basic',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    description: 'Descrição do plano',
    example: 'Plano básico para pequenas empresas',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Preço mensal em centavos (ex: 29900 = R$299,00)',
    example: 29900,
  })
  @IsInt()
  @Min(0)
  priceMonthly: number;

  @ApiPropertyOptional({
    description: 'Price ID ou Product ID do Stripe',
    example: 'price_xxxxxxxxxxxxx',
  })
  @IsString()
  @IsOptional()
  stripePriceId?: string;

  @ApiPropertyOptional({
    description: 'Dias de teste gratuito',
    example: 0,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  trialDays?: number;

  @ApiPropertyOptional({
    description: 'Máximo de usuários (-1 = ilimitado)',
    example: 1,
    default: -1,
  })
  @IsInt()
  @IsOptional()
  maxUsers?: number;

  @ApiPropertyOptional({
    description: 'Máximo de sub-empresas (-1 = ilimitado)',
    example: 1,
    default: -1,
  })
  @IsInt()
  @IsOptional()
  maxCompany?: number;

  @ApiPropertyOptional({
    description: 'Máximo de transações (-1 = ilimitado)',
    example: -1,
    default: -1,
  })
  @IsInt()
  @IsOptional()
  maxTransactions?: number;

  @ApiPropertyOptional({
    description: 'Máximo de contatos (-1 = ilimitado)',
    example: -1,
    default: -1,
  })
  @IsInt()
  @IsOptional()
  maxContacts?: number;
}
