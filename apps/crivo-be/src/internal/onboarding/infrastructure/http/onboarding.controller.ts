import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { OnboardCompanyUseCase } from '../../application/use-cases/onboard-company.use-case';
import { OnboardCompanyDto } from './dtos/onboard-company.dto';
import { OnboardCompanyResponseDto } from './dtos/onboard-company-response.dto';
import { ErrorResponseDto } from '../../../../libs/http/dtos/error-response.dto';
import type { JwtPayload } from '../../../../libs/auth/jwt.strategy';

@ApiTags('Onboarding')
@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardCompanyUseCase: OnboardCompanyUseCase) {}

  @Post('setup-company')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Configurar empresa e iniciar assinatura',
    description:
      'Cria o Stripe Customer, a empresa, a assinatura com status INCOMPLETE ' +
      'e vincula o usuário logado como OWNER. ' +
      'Retorna a URL de checkout do Stripe para completar o pagamento. ' +
      'Requer autenticação — o usuário é criado automaticamente via JIT no primeiro login.',
  })
  @ApiCreatedResponse({
    description: 'Empresa criada e URL de checkout gerada',
    type: OnboardCompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Plano inválido ou sem price configurado',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário ou plano não encontrado',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Usuário já vinculado a uma empresa',
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
  async setupCompany(
    @Body() dto: OnboardCompanyDto,
    @Req() req: Request,
  ): Promise<OnboardCompanyResponseDto> {
    const payload = req.user as JwtPayload;

    return this.onboardCompanyUseCase.execute({
      keycloakId: payload.sub,
      planType: dto.planType,
      companyName: dto.companyName,
    });
  }
}
