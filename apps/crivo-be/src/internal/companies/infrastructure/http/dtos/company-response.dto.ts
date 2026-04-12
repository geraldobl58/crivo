import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CompanyResponseDto {
  @ApiProperty({
    description: 'ID único da empresa (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Minha Empresa LTDA',
  })
  name: string;

  @ApiProperty({
    description: 'CNPJ/CPF da empresa',
    example: '12.345.678/0001-90',
  })
  taxId: string;

  @ApiPropertyOptional({
    description: 'ID do customer no Stripe',
    example: 'cus_ABC123',
    nullable: true,
  })
  stripeCustomerId: string | null;

  @ApiProperty({
    description: 'Data de criação',
    example: '2026-04-12T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2026-04-12T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class PaginatedCompanyResponseDto {
  @ApiProperty({ type: [CompanyResponseDto] })
  items: CompanyResponseDto[];

  @ApiProperty({ example: 42, description: 'Total de registros' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página atual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Itens por página' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total de páginas' })
  totalPages: number;
}
