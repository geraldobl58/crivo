import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { GetPlansUseCase } from '../../application/use-cases/get-plans.use-case';
import { GetPlanByIdUseCase } from '../../application/use-cases/get-plan-by-id.use-case';
import { CreatePlanUseCase } from '../../application/use-cases/create-plan.use-case';
import { UpdatePlanUseCase } from '../../application/use-cases/update-plan.use-case';

import { CreatePlanDto } from './dtos/create-plan.dto';
import { UpdatePlanDto } from './dtos/update-plan.dto';
import { GetPlansQueryDto } from './dtos/get-plans.query.dto';
import {
  PlanResponseDto,
  PaginatedPlanResponseDto,
} from './dtos/plan-response.dto';
import { ErrorResponseDto } from '../../../../libs/http/dtos/error-response.dto';

import { Public } from '../../../../libs/auth/public.decorator';
import { RolesGuard } from '../../../../libs/guards/roles.guard';
import { Roles } from '../../../../libs/guards/roles.decorator';

@ApiTags('Planos')
@Controller('plans')
export class PlanController {
  constructor(
    private readonly getPlans: GetPlansUseCase,
    private readonly getPlanById: GetPlanByIdUseCase,
    private readonly createPlan: CreatePlanUseCase,
    private readonly updatePlan: UpdatePlanUseCase,
  ) {}

  @Get()
  @Public()
  @ApiOperation({ summary: 'Listar planos ativos com preços e limites' })
  @ApiOkResponse({
    description: 'Lista paginada de planos',
    type: PaginatedPlanResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Parâmetros de consulta inválidos',
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
  async findAll(@Query() query: GetPlansQueryDto) {
    return this.getPlans.execute(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Buscar plano por ID' })
  @ApiOkResponse({
    description: 'Plano encontrado',
    type: PlanResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Plano não encontrado',
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
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getPlanById.execute(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'SUPPORT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar um novo plano (uso interno)' })
  @ApiCreatedResponse({
    description: 'Plano criado com sucesso',
    type: PlanResponseDto,
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
    description: 'Permissão insuficiente (requer OWNER ou SUPPORT)',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Já existe um plano com este tipo',
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
  async create(@Body() dto: CreatePlanDto) {
    return this.createPlan.execute(dto);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('OWNER', 'SUPPORT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar plano (stripePriceId, trialDays, etc.)' })
  @ApiOkResponse({
    description: 'Plano atualizado com sucesso',
    type: PlanResponseDto,
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
    description: 'Permissão insuficiente (requer OWNER ou SUPPORT)',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Plano não encontrado',
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
    @Body() dto: UpdatePlanDto,
  ) {
    return this.updatePlan.execute(id, dto);
  }
}
