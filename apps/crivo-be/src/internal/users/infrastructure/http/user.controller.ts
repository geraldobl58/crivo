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
  @ApiCreatedResponse({ description: 'Usuário criado com sucesso' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos no corpo da requisição',
  })
  @ApiConflictResponse({
    description: 'Já existe um usuário com este email ou keycloakId',
  })
  @ApiUnprocessableEntityResponse({
    description: 'Erro de validação nos campos enviados',
  })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  async create(@Body() dto: CreateUserDto) {
    return this.createUser.execute(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar usuários com filtros e paginação' })
  @ApiOkResponse({ description: 'Lista paginada de usuários' })
  @ApiBadRequestResponse({ description: 'Parâmetros de consulta inválidos' })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  async findAll(@Query() query: GetUsersQueryDto) {
    return this.getUsers.execute(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiOkResponse({ description: 'Usuário encontrado' })
  @ApiBadRequestResponse({ description: 'ID inválido (deve ser UUID)' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getUserById.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiOkResponse({ description: 'Usuário atualizado com sucesso' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos no corpo da requisição',
  })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiUnprocessableEntityResponse({
    description: 'Erro de validação nos campos enviados',
  })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
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
  @ApiBadRequestResponse({ description: 'ID inválido (deve ser UUID)' })
  @ApiNotFoundResponse({ description: 'Usuário não encontrado' })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  @ApiInternalServerErrorResponse({ description: 'Erro interno do servidor' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.deleteUser.execute(id);
  }
}
