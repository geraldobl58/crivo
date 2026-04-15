import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import { CreateCompanyUseCase } from '../../application/use-cases/create-company.use-case';
import { GetCompaniesUseCase } from '../../application/use-cases/get-company.use-case';
import { GetCompanyByIdUseCase } from '../../application/use-cases/get-company-by-id.use-case';
import { UpdateCompanyUseCase } from '../../application/use-cases/update-company.use-case';
import { DeleteCompanyUseCase } from '../../application/use-cases/delete-company.use-case';

import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { GetCompaniesQueryDto } from './dtos/get-company.query.dto';
import {
  CompanyResponseDto,
  PaginatedCompanyResponseDto,
} from './dtos/company-response.dto';
import { ErrorResponseDto } from '../../../../libs/http/dtos/error-response.dto';

import { TenantInterceptor } from '../../../../libs/tenant/tenant.interceptor';
import { Tenant } from '../../../../libs/tenant/tenant.decorator';
import { PlanLimitGuard } from '../../../../libs/guards/plan-limit.guard';
import { RolesGuard } from '../../../../libs/guards/roles.guard';
import { Roles } from '../../../../libs/guards/roles.decorator';
import { PlanResource } from '../../../../libs/guards/plan-resource.decorator';

@ApiTags('Empresas')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@Controller('companies')
export class CompanyController {
  constructor(
    private readonly createCompany: CreateCompanyUseCase,
    private readonly getCompanies: GetCompaniesUseCase,
    private readonly getCompanyById: GetCompanyByIdUseCase,
    private readonly updateCompany: UpdateCompanyUseCase,
    private readonly deleteCompany: DeleteCompanyUseCase,
  ) {}

  @Post()
  @UseGuards(RolesGuard, PlanLimitGuard)
  @Roles('ADMIN', 'OWNER', 'SUPPORT')
  @PlanResource('company')
  @ApiOperation({ summary: 'Criar uma nova empresa' })
  @ApiCreatedResponse({
    description: 'Empresa criada com sucesso',
    type: CompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos no corpo da requisição',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description:
      'Permissão insuficiente (requer ADMIN, OWNER ou SUPPORT) ou assinatura inativa',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Já existe uma empresa com este CNPJ',
    type: ErrorResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Erro de validação nos campos enviados',
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
  async create(
    @Body() dto: CreateCompanyDto,
    @Tenant('companyId') parentCompanyId: string,
  ) {
    return this.createCompany.execute({ ...dto, parentCompanyId });
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas com filtros e paginação' })
  @ApiOkResponse({
    description: 'Lista paginada de empresas',
    type: PaginatedCompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros de consulta inválidos',
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
  async findAll(
    @Query() query: GetCompaniesQueryDto,
    @Tenant('companyId') companyId: string,
  ) {
    return this.getCompanies.execute({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar empresa por ID' })
  @ApiOkResponse({
    description: 'Empresa encontrada',
    type: CompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'ID inválido (deve ser UUID)',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Empresa não encontrada',
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
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Tenant('companyId') companyId: string,
  ) {
    return this.getCompanyById.execute(id, companyId);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER', 'SUPPORT')
  @ApiOperation({ summary: 'Atualizar empresa' })
  @ApiOkResponse({
    description: 'Empresa atualizada com sucesso',
    type: CompanyResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos no corpo da requisição',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Permissão insuficiente (requer ADMIN, OWNER ou SUPPORT)',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Empresa não encontrada',
    type: ErrorResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Erro de validação nos campos enviados',
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
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
    @Tenant('companyId') companyId: string,
  ) {
    return this.updateCompany.execute(id, dto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'OWNER', 'SUPPORT')
  @ApiOperation({ summary: 'Remover empresa' })
  @ApiNoContentResponse({ description: 'Empresa removida com sucesso' })
  @ApiBadRequestResponse({
    description: 'ID inválido (deve ser UUID)',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Permissão insuficiente (requer ADMIN, OWNER ou SUPPORT)',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Empresa não encontrada',
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
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Tenant('companyId') companyId: string,
  ) {
    return this.deleteCompany.execute(id, companyId);
  }
}
