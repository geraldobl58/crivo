import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '../../../domain/enums/user.role.enum';

export class UserResponseDto {
  @ApiProperty({
    description: 'ID único do usuário (UUID)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  id: string;

  @ApiProperty({
    description: 'ID do usuário no Keycloak',
    example: 'kc-uuid-1234',
  })
  keycloakId: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@empresa.com',
  })
  email: string;

  @ApiPropertyOptional({
    description: 'Primeiro nome',
    example: 'João',
    nullable: true,
  })
  firstname: string | null;

  @ApiPropertyOptional({
    description: 'Sobrenome',
    example: 'Silva',
    nullable: true,
  })
  lastname: string | null;

  @ApiProperty({
    description: 'Papel do usuário na plataforma',
    enum: Role,
    example: Role.USER,
  })
  role: Role;

  @ApiPropertyOptional({
    description: 'ID da empresa à qual o usuário pertence',
    example: '550e8400-e29b-41d4-a716-446655440000',
    nullable: true,
  })
  companyId: string | null;

  @ApiProperty({
    description: 'Data de criação',
    example: '2026-04-12T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2026-04-12T00:00:00.000Z',
  })
  updatedAt: Date;
}

export class PaginatedUserResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  items: UserResponseDto[];

  @ApiProperty({ example: 42, description: 'Total de registros' })
  total: number;

  @ApiProperty({ example: 1, description: 'Página atual' })
  page: number;

  @ApiProperty({ example: 10, description: 'Itens por página' })
  limit: number;

  @ApiProperty({ example: 5, description: 'Total de páginas' })
  totalPages: number;
}
