import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Minha Empresa LTDA',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'CNPJ da empresa',
    example: '12.345.678/0001-90',
  })
  @IsString()
  @IsNotEmpty()
  taxId: string;
}
