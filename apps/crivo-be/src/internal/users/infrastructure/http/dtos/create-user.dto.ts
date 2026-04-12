import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Role } from '../../../domain/enums/user.role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'ID do Keycloak',
    example: 'kc-uuid-1234',
  })
  @IsString()
  @IsNotEmpty()
  keycloakId: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'usuario@empresa.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Primeiro nome do usuário',
    example: 'João',
  })
  @IsString()
  @IsOptional()
  firstname?: string;

  @ApiPropertyOptional({
    description: 'Sobrenome do usuário',
    example: 'Silva',
  })
  @IsString()
  @IsOptional()
  lastname?: string;

  @ApiProperty({
    description: 'Papel do usuário',
    enum: Role,
    example: Role.USER,
  })
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;

  @ApiProperty({
    description: 'ID da empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  companyId: string;
}
