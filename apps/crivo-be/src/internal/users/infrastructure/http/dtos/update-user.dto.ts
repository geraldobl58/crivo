import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Role } from '../../../domain/enums/user.role.enum';

export class UpdateUserDto {
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

  @ApiPropertyOptional({
    description: 'Email do usuário',
    example: 'usuario@empresa.com',
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'Papel do usuário',
    enum: Role,
    example: Role.USER,
  })
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @ApiPropertyOptional({
    description: 'ID da empresa',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsOptional()
  companyId?: string;
}
