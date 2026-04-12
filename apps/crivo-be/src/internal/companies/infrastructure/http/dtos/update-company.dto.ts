import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCompanyDto {
  @ApiPropertyOptional({
    description: 'Nome da empresa',
    example: 'Nova Empresa LTDA',
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: 'CNPJ da empresa',
    example: '98.765.432/0001-10',
  })
  @IsString()
  @IsOptional()
  taxId?: string;
}
