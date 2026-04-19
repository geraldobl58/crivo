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

import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUsersUseCase } from '../../application/use-cases/get-user.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';

import { KeycloakAdminService } from '../../../../libs/keycloak/keycloak-admin.service';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { GetUsersQueryDto } from './dtos/get-user.query.dto';
import {
  UserResponseDto,
  PaginatedUserResponseDto,
} from './dtos/user-response.dto';
import { ErrorResponseDto } from '../../../../libs/http/dtos/error-response.dto';

import { TenantInterceptor } from '../../../../libs/tenant/tenant.interceptor';
import { Tenant } from '../../../../libs/tenant/tenant.decorator';
import { PlanLimitGuard } from '../../../../libs/guards/plan-limit.guard';
import { RolesGuard } from '../../../../libs/guards/roles.guard';
import { Roles } from '../../../../libs/guards/roles.decorator';
import { PlanResource } from '../../../../libs/guards/plan-resource.decorator';

@ApiTags('Usuários')
@ApiBearerAuth()
@UseInterceptors(TenantInterceptor)
@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUsers: GetUsersUseCase,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
    private readonly keycloakAdmin: KeycloakAdminService,
  ) {}

  @Post()
  @UseGuards(RolesGuard, PlanLimitGuard)
  @Roles('ADMIN', 'OWNER', 'SUPPORT')
  @PlanResource('users')
  @ApiOperation({ summary: 'Criar um novo usuário na empresa' })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
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
      'Permissão insuficiente (requer ADMIN, OWNER ou SUPPORT) ou limite de usuários do plano atingido',
    type: ErrorResponseDto,
  })
  @ApiConflictResponse({
    description: 'Já existe um usuário com este email ou keycloakId',
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
    @Body() dto: CreateUserDto,
    @Tenant('companyId') companyId: string,
  ) {
    const tempPassword = Math.random().toString(36).slice(2) + 'A1!';

    const { keycloakId } = await this.keycloakAdmin.createUser({
      email: dto.email,
      firstName: dto.firstname,
      lastName: dto.lastname,
      password: tempPassword,
      temporary: true,
    });

    return this.createUser.execute({ ...dto, keycloakId, companyId });
  }

  @Get()
  @ApiOperation({
    summary: 'Listar usuários da empresa com filtros e paginação',
  })
  @ApiOkResponse({
    description: 'Lista paginada de usuários',
    type: PaginatedUserResponseDto,
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
    @Query() query: GetUsersQueryDto,
    @Tenant('companyId') companyId: string,
  ) {
    return this.getUsers.execute({ ...query, companyId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID (dentro da empresa)' })
  @ApiOkResponse({ description: 'Usuário encontrado', type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'ID inválido (deve ser UUID)',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Usuário não pertence à sua organização',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
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
    return this.getUserById.execute(id, companyId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário da empresa' })
  @ApiOkResponse({
    description: 'Usuário atualizado com sucesso',
    type: UserResponseDto,
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
    description: 'Usuário não pertence à sua organização',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
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
    @Body() dto: UpdateUserDto,
    @Tenant('companyId') companyId: string,
  ) {
    return this.updateUser.execute(id, dto, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles('OWNER')
  @ApiOperation({ summary: 'Remover usuário da empresa' })
  @ApiNoContentResponse({ description: 'Usuário removido com sucesso' })
  @ApiBadRequestResponse({
    description: 'ID inválido (deve ser UUID)',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token de autenticação inválido ou ausente',
    type: ErrorResponseDto,
  })
  @ApiForbiddenResponse({
    description: 'Usuário não pertence à sua organização',
    type: ErrorResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
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
    @Tenant('userId') currentUserId: string,
  ) {
    return this.deleteUser.execute(id, companyId, currentUserId);
  }
}
