import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ListCompaniesUseCase } from '../../application/use-cases/list-companies.use-case';
import { GetCompanyDetailUseCase } from '../../application/use-cases/get-company-detail.use-case';
import { GetPlatformMetricsUseCase } from '../../application/use-cases/get-platform-metrics.use-case';
import { ImpersonateUserUseCase } from '../../application/use-cases/impersonate-user.use-case';

import { ListCompaniesQueryDto } from './dtos/list-companies.query.dto';
import {
  PaginatedAdminCompanyResponseDto,
  PlatformMetricsResponseDto,
  ImpersonationResponseDto,
} from './dtos/admin-response.dto';
import { ErrorResponseDto } from '../../../../libs/http/dtos/error-response.dto';

import { RolesGuard } from '../../../../libs/guards/roles.guard';
import { Roles } from '../../../../libs/guards/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('SUPPORT')
@ApiUnauthorizedResponse({
  description: 'Token inválido ou ausente',
  type: ErrorResponseDto,
})
@ApiForbiddenResponse({
  description: 'Acesso restrito a role SUPPORT',
  type: ErrorResponseDto,
})
@Controller('admin')
export class AdminController {
  constructor(
    private readonly listCompanies: ListCompaniesUseCase,
    private readonly getCompanyDetail: GetCompanyDetailUseCase,
    private readonly getPlatformMetrics: GetPlatformMetricsUseCase,
    private readonly impersonateUser: ImpersonateUserUseCase,
  ) {}

  @Get('metrics')
  @ApiOperation({
    summary: 'Métricas gerais da plataforma',
    description:
      'Retorna totais de empresas, usuários, receita, e distribuição de planos/status.',
  })
  @ApiOkResponse({
    description: 'Métricas da plataforma',
    type: PlatformMetricsResponseDto,
  })
  async metrics() {
    return this.getPlatformMetrics.execute();
  }

  @Get('companies')
  @ApiOperation({
    summary: 'Listar todas as empresas (cross-tenant)',
    description:
      'Lista paginada de todas as empresas da plataforma com info de assinatura. Sem filtro de tenant.',
  })
  @ApiOkResponse({
    description: 'Lista paginada de empresas',
    type: PaginatedAdminCompanyResponseDto,
  })
  async companies(@Query() query: ListCompaniesQueryDto) {
    return this.listCompanies.execute(query);
  }

  @Get('companies/:id')
  @ApiOperation({
    summary: 'Detalhe completo de uma empresa',
    description:
      'Retorna empresa com usuários, assinatura, faturas e sub-empresas.',
  })
  @ApiOkResponse({ description: 'Detalhe da empresa' })
  @ApiNotFoundResponse({
    description: 'Empresa não encontrada',
    type: ErrorResponseDto,
  })
  async companyDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.getCompanyDetail.execute(id);
  }

  @Post('companies/:id/impersonate')
  @ApiOperation({
    summary: 'Gerar token de impersonação',
    description:
      'Gera um JWT access token para o owner da empresa via Keycloak token exchange. Use com cautela — ações ficam logadas.',
  })
  @ApiOkResponse({
    description: 'Token de impersonação gerado',
    type: ImpersonationResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Empresa não encontrada',
    type: ErrorResponseDto,
  })
  async impersonate(@Param('id', ParseUUIDPipe) id: string) {
    return this.impersonateUser.execute(id);
  }
}
