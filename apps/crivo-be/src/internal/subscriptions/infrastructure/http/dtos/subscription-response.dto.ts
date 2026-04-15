import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PlanType, SubscriptionStatus } from '@prisma/client';

class SubscriptionPlanDto {
  @ApiProperty({
    description: 'Tipo do plano',
    enum: PlanType,
    example: 'PROFESSIONAL',
  })
  type: PlanType;

  @ApiProperty({ description: 'Nome do plano', example: 'Professional' })
  name: string;

  @ApiProperty({ description: 'Preço mensal em centavos', example: 39900 })
  priceMonthly: number;

  @ApiProperty({
    description: 'Máximo de usuários (-1 = ilimitado)',
    example: 3,
  })
  maxUsers: number;

  @ApiProperty({
    description: 'Máximo de sub-empresas (-1 = ilimitado)',
    example: 3,
  })
  maxCompany: number;

  @ApiProperty({
    description: 'Máximo de transações (-1 = ilimitado)',
    example: 10000,
  })
  maxTransactions: number;

  @ApiProperty({
    description: 'Máximo de contatos (-1 = ilimitado)',
    example: 5000,
  })
  maxContacts: number;
}

export class SubscriptionResponseDto {
  @ApiProperty({ description: 'ID da assinatura (UUID)' })
  id: string;

  @ApiProperty({ description: 'ID da empresa (UUID)' })
  companyId: string;

  @ApiProperty({ description: 'ID do plano (UUID)' })
  planId: string;

  @ApiPropertyOptional({
    description: 'ID da subscription no Stripe',
    nullable: true,
  })
  stripeSubscriptionId: string | null;

  @ApiProperty({
    description: 'Status da assinatura',
    enum: SubscriptionStatus,
    example: 'ACTIVE',
  })
  status: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Início do período atual',
    nullable: true,
  })
  currentPeriodStart: Date | null;

  @ApiPropertyOptional({ description: 'Fim do período atual', nullable: true })
  currentPeriodEnd: Date | null;

  @ApiPropertyOptional({ description: 'Início do trial', nullable: true })
  trialStart: Date | null;

  @ApiPropertyOptional({ description: 'Fim do trial', nullable: true })
  trialEnd: Date | null;

  @ApiProperty({
    description: 'Se cancela no fim do período atual',
    example: false,
  })
  cancelAtPeriodEnd: boolean;

  @ApiPropertyOptional({ description: 'Data do cancelamento', nullable: true })
  canceledAt: Date | null;

  @ApiPropertyOptional({
    description: 'Informações do plano vinculado',
    type: SubscriptionPlanDto,
  })
  plan: SubscriptionPlanDto | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  updatedAt: Date;
}
