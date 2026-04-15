import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus } from '@prisma/client';

export class InvoiceResponseDto {
  @ApiProperty({ description: 'ID da fatura (UUID)' })
  id: string;

  @ApiProperty({ description: 'ID da assinatura (UUID)' })
  subscriptionId: string;

  @ApiPropertyOptional({
    description: 'ID da invoice no Stripe',
    nullable: true,
  })
  stripeInvoiceId: string | null;

  @ApiPropertyOptional({
    description: 'ID do payment intent no Stripe',
    nullable: true,
  })
  stripePaymentIntentId: string | null;

  @ApiProperty({
    description: 'Status da fatura',
    enum: InvoiceStatus,
    example: 'PAID',
  })
  status: InvoiceStatus;

  @ApiProperty({ description: 'Valor cobrado em centavos', example: 29900 })
  amountDue: number;

  @ApiProperty({ description: 'Valor pago em centavos', example: 29900 })
  amountPaid: number;

  @ApiProperty({ description: 'Moeda', example: 'brl' })
  currency: string;

  @ApiPropertyOptional({
    description: 'URL para visualizar a fatura',
    nullable: true,
  })
  invoiceUrl: string | null;

  @ApiPropertyOptional({ description: 'URL do PDF da fatura', nullable: true })
  invoicePdf: string | null;

  @ApiPropertyOptional({
    description: 'Início do período de referência',
    nullable: true,
  })
  periodStart: Date | null;

  @ApiPropertyOptional({
    description: 'Fim do período de referência',
    nullable: true,
  })
  periodEnd: Date | null;

  @ApiPropertyOptional({
    description: 'Data do pagamento efetivo',
    nullable: true,
  })
  paidAt: Date | null;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data da última atualização' })
  updatedAt: Date;
}

export class PaginatedInvoiceResponseDto {
  @ApiProperty({ type: [InvoiceResponseDto] })
  items: InvoiceResponseDto[];

  @ApiProperty({ example: 5, description: 'Total de registros' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página atual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Itens por página' })
  limit: number;

  @ApiProperty({ example: 1, description: 'Total de páginas' })
  totalPages: number;
}
