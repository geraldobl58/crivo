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
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
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

@ApiTags('Empresas')
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
  @ApiOperation({ summary: 'Criar uma nova empresa' })
  @ApiCreatedResponse({ description: 'Empresa criada com sucesso' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos no corpo da requisição',
  })
  @ApiConflictResponse({ description: 'Já existe uma empresa com este CNPJ' })
  @ApiUnprocessableEntityResponse({
    description: 'Erro de validação nos campos enviados',
  })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  async create(@Body() dto: CreateCompanyDto) {
    return this.createCompany.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas com filtros e paginação' })
  @ApiOkResponse({ description: 'Lista paginada de empresas' })
  @ApiBadRequestResponse({ description: 'Parâmetros de consulta inválidos' })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  async findAll(@Query() query: GetCompaniesQueryDto) {
    return this.getCompanies.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar empresa por ID' })
  @ApiOkResponse({ description: 'Empresa encontrada' })
  @ApiBadRequestResponse({ description: 'ID inválido (deve ser UUID)' })
  @ApiNotFoundResponse({ description: 'Empresa não encontrada' })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getCompanyById.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar empresa' })
  @ApiOkResponse({ description: 'Empresa atualizada com sucesso' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos no corpo da requisição',
  })
  @ApiNotFoundResponse({ description: 'Empresa não encontrada' })
  @ApiUnprocessableEntityResponse({
    description: 'Erro de validação nos campos enviados',
  })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCompanyDto,
  ) {
    return this.updateCompany.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover empresa' })
  @ApiNoContentResponse({ description: 'Empresa removida com sucesso' })
  @ApiBadRequestResponse({ description: 'ID inválido (deve ser UUID)' })
  @ApiNotFoundResponse({ description: 'Empresa não encontrada' })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteCompany.execute(id);
  }
}
