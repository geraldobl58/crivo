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

import { CreateUserUseCase } from '../../application/use-cases/create-user.use-case';
import { GetUsersUseCase } from '../../application/use-cases/get-user.use-case';
import { GetUserByIdUseCase } from '../../application/use-cases/get-user-by-id.use-case';
import { UpdateUserUseCase } from '../../application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from '../../application/use-cases/delete-user.use-case';

import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { GetUsersQueryDto } from './dtos/get-user.query.dto';
import {
  UserResponseDto,
  PaginatedUserResponseDto,
} from './dtos/user-response.dto';
import { ErrorResponseDto } from '../../../../libs/http/dtos/error-response.dto';

@ApiTags('Usuários')
@Controller('users')
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUsers: GetUsersUseCase,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly updateUser: UpdateUserUseCase,
    private readonly deleteUser: DeleteUserUseCase,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos no corpo da requisição',
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
  async create(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuários com filtros e paginação' })
  @ApiOkResponse({
    description: 'Lista paginada de usuários',
    type: PaginatedUserResponseDto,
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
  async findAll(@Query() query: GetUsersQueryDto) {
    return this.getUsers.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiOkResponse({ description: 'Usuário encontrado', type: UserResponseDto })
  @ApiBadRequestResponse({
    description: 'ID inválido (deve ser UUID)',
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
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getUserById.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiOkResponse({
    description: 'Usuário atualizado com sucesso',
    type: UserResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados inválidos no corpo da requisição',
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
  ) {
    return this.updateUser.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover usuário' })
  @ApiNoContentResponse({ description: 'Usuário removido com sucesso' })
  @ApiBadRequestResponse({
    description: 'ID inválido (deve ser UUID)',
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
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUser.execute(id);
  }
}
