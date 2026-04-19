import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateCheckoutSessionUseCase } from '../../application/use-cases/create-checkout-session.use-case';
import { CreatePortalSessionUseCase } from '../../application/use-cases/create-portal-session.use-case';
import { HandleStripeWebhookUseCase } from '../../application/use-cases/handle-stripe-webhook.use-case';
import { CreateCheckoutSessionDto } from './dtos/create-checkout-session.dto';
import { CheckoutSessionResponseDto } from './dtos/checkout-session-response.dto';
import { PortalSessionResponseDto } from './dtos/portal-session-response.dto';
import { ErrorResponseDto } from '../../../../libs/http/dtos/error-response.dto';
import { Public } from '../../../../libs/auth/public.decorator';
import {
  TenantInterceptor,
  AllowExpiredTrial,
} from '../../../../libs/tenant/tenant.interceptor';
import { Tenant } from '../../../../libs/tenant/tenant.decorator';
import type { TenantContext } from '../../../../libs/tenant/tenant.context';

@ApiTags('Stripe')
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly createCheckoutSessionUseCase: CreateCheckoutSessionUseCase,
    private readonly createPortalSessionUseCase: CreatePortalSessionUseCase,
    private readonly handleStripeWebhookUseCase: HandleStripeWebhookUseCase,
  ) {}

  @Post('checkout')
  @UseInterceptors(TenantInterceptor)
  @AllowExpiredTrial()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar sessão de checkout para upgrade de plano',
    description:
      'Cria uma sessão do Stripe Checkout. ' +
      'Retorna a URL para redirecionar o usuário ao pagamento.',
  })
  @ApiCreatedResponse({
    description: 'URL do checkout criada com sucesso',
    type: CheckoutSessionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Plano inválido ou sem price configurado',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  async checkout(
    @Body() dto: CreateCheckoutSessionDto,
    @Tenant() tenant: TenantContext,
  ): Promise<CheckoutSessionResponseDto> {
    return this.createCheckoutSessionUseCase.execute({
      keycloakId: tenant.keycloakId,
      companyId: tenant.companyId,
      planType: dto.planType,
    });
  }

  @Post('portal')
  @UseInterceptors(TenantInterceptor)
  @AllowExpiredTrial()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Criar sessão do Customer Portal do Stripe',
    description:
      'Gera uma URL do Stripe Customer Portal onde o usuário pode gerenciar ' +
      'assinatura, método de pagamento, cancelamento e faturas.',
  })
  @ApiCreatedResponse({
    description: 'URL do portal criada com sucesso',
    type: PortalSessionResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Empresa sem assinatura ativa',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiInternalServerErrorResponse({
    description: 'Erro interno do servidor',
    type: ErrorResponseDto,
  })
  async portal(
    @Tenant() tenant: TenantContext,
  ): Promise<PortalSessionResponseDto> {
    return this.createPortalSessionUseCase.execute({
      companyId: tenant.companyId,
    });
  }

  @Post('webhook')
  @Public()
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '[Stripe only] Receber eventos do Stripe',
    description:
      'Endpoint exclusivo para webhooks do Stripe. ' +
      'Verifica a assinatura `stripe-signature` antes de processar.',
  })
  @ApiOkResponse({ description: 'Evento processado com sucesso' })
  @ApiBadRequestResponse({
    description: 'Assinatura inválida ou evento malformado',
    type: ErrorResponseDto,
  })
  async webhook(
    @Req() req: Request & { rawBody?: Buffer },
    @Headers('stripe-signature') signature: string,
  ): Promise<void> {
    const rawBody = req.rawBody ?? Buffer.from(JSON.stringify(req.body));

    await this.handleStripeWebhookUseCase.execute({ rawBody, signature });
  }
}
