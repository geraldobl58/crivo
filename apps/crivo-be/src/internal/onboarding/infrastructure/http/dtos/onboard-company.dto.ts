import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { PlanType } from '@prisma/client';

export class OnboardCompanyDto {
  @ApiProperty({
    description: 'Tipo do plano desejado',
    enum: PlanType,
    example: 'BASIC',
  })
  @IsEnum(PlanType)
  planType: PlanType;

  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Minha Empresa LTDA',
  })
  @IsString()
  @IsNotEmpty()
  companyName: string;
}
