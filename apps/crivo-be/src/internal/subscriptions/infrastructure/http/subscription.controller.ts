import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GetMySubscriptionUseCase } from '../../application/use-cases/get-my-subscription.use-case';
import { GetInvoicesUseCase } from '../../application/use-cases/get-invoices.use-case';

import { SubscriptionResponseDto } from './dtos/subscription-response.dto';
import {
  InvoiceResponseDto,
  PaginatedInvoiceResponseDto,
} from './dtos/invoice-response.dto';
import { GetInvoicesQueryDto } from './dtos/get-invoices.query.dto';
import { ErrorResponseDto } from '../../../../libs/http/dtos/error-response.dto';

import { TenantInterceptor } from '../../../../libs/tenant/tenant.interceptor';
import { Tenant } from '../../../../libs/tenant/tenant.decorator';

@ApiTags('Assinaturas')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(
    private readonly getMySubscription: GetMySubscriptionUseCase,
    private readonly getInvoices: GetInvoicesUseCase,
  ) {}

  @Get('me')
  @ApiOperation({
    summary: 'Assinatura ativa do tenant',
    description:
      'Retorna a assinatura da empresa logada com detalhes do plano vinculado.',
  })
  @ApiOkResponse({
    description: 'Assinatura encontrada',
    type: SubscriptionResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Nenhuma assinatura encontrada para esta empresa',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de requisições excedido',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  async me(@Tenant('companyId') companyId: string) {
    return this.getMySubscription.execute(companyId);
  }

  @Get('invoices')
  @ApiOperation({
    summary: 'Faturas do tenant',
    description:
      'Retorna o histórico de faturas da empresa logada, paginado por data decrescente.',
  })
  @ApiOkResponse({
    description: 'Lista paginada de faturas',
    type: PaginatedInvoiceResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Nenhuma assinatura encontrada para esta empresa',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiTooManyRequestsResponse({
    description: 'Limite de requisições excedido',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  async invoices(
    @Query() query: GetInvoicesQueryDto,
    @Tenant('companyId') companyId: string,
  ) {
    return this.getInvoices.execute(companyId, query);
  }
}
