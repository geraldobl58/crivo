import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePlanDto {
  @ApiPropertyOptional({
    description: 'Nome do plano',
    example: 'Crivo Basic',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'Descrição do plano',
    example: 'Plano básico para pequenas empresas',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'Preço mensal em centavos (ex: 29900 = R$299,00)',
    example: 29900,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  priceMonthly?: number;

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
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  trialDays?: number;

  @ApiPropertyOptional({
    description: 'Máximo de usuários (-1 = ilimitado)',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  maxUsers?: number;

  @ApiPropertyOptional({
    description: 'Máximo de sub-empresas (-1 = ilimitado)',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  maxCompany?: number;

  @ApiPropertyOptional({
    description: 'Máximo de transações (-1 = ilimitado)',
    example: -1,
  })
  @IsInt()
  @IsOptional()
  maxTransactions?: number;

  @ApiPropertyOptional({
    description: 'Máximo de contatos (-1 = ilimitado)',
    example: -1,
  })
  @IsInt()
  @IsOptional()
  maxContacts?: number;

  @ApiPropertyOptional({
    description: 'Se o plano está ativo',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
