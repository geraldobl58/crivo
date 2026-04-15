import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType } from '@prisma/client';

export class PlanResponseDto {
  @ApiProperty({ description: 'ID único do plano (UUID)' })
  id: string;

  @ApiProperty({
    description: 'Tipo do plano',
    enum: PlanType,
    example: 'BASIC',
  })
  type: PlanType;

  @ApiProperty({ description: 'Nome do plano', example: 'Crivo Basic' })
  name: string;

  @ApiPropertyOptional({ description: 'Descrição do plano', nullable: true })
  description: string | null;

  @ApiProperty({
    description: 'Preço mensal em centavos (ex: 29900 = R$299,00)',
    example: 29900,
  })
  priceMonthly: number;

  @ApiPropertyOptional({
    description: 'Price ID do Stripe',
    nullable: true,
    example: 'price_xxxxxxxxxxxxx',
  })
  stripePriceId: string | null;

  @ApiProperty({ description: 'Dias de teste gratuito', example: 0 })
  trialDays: number;

  @ApiProperty({
    description: 'Máximo de usuários (-1 = ilimitado)',
    example: 1,
  })
  maxUsers: number;

  @ApiProperty({
    description: 'Máximo de sub-empresas (-1 = ilimitado)',
    example: 1,
  })
  maxCompany: number;

  @ApiProperty({
    description: 'Máximo de transações (-1 = ilimitado)',
    example: -1,
  })
  maxTransactions: number;

  @ApiProperty({
    description: 'Máximo de contatos (-1 = ilimitado)',
    example: -1,
  })
  maxContacts: number;

  @ApiProperty({ description: 'Se o plano está ativo', example: true })
  isActive: boolean;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  updatedAt: Date;
}

export class PaginatedPlanResponseDto {
  @ApiProperty({ type: [PlanResponseDto] })
  items: PlanResponseDto[];

  @ApiProperty({ example: 4, description: 'Total de registros' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página atual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Itens por página' })
  limit: number;

  @ApiProperty({ example: 1, description: 'Total de páginas' })
  totalPages: number;
}
