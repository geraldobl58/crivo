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
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
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
  async create(@Body() dto: CreateCompanyDto) {
    return this.createCompany.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar empresas com filtros e paginação' })
  @ApiOkResponse({ description: 'Lista paginada de empresas' })
  async findAll(@Query() query: GetCompaniesQueryDto) {
    return this.getCompanies.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar empresa por ID' })
  @ApiOkResponse({ description: 'Empresa encontrada' })
  @ApiNotFoundResponse({ description: 'Empresa não encontrada' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getCompanyById.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar empresa' })
  @ApiOkResponse({ description: 'Empresa atualizada com sucesso' })
  @ApiNotFoundResponse({ description: 'Empresa não encontrada' })
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
  @ApiNotFoundResponse({ description: 'Empresa não encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteCompany.execute(id);
  }
}
