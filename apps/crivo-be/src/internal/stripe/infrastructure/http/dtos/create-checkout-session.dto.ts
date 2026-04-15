import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { PlanType } from '@prisma/client';

export class CreateCheckoutSessionDto {
  @ApiProperty({
    description: 'Plano para o qual o usuário deseja fazer upgrade',
    enum: PlanType,
    example: 'PROFESSIONAL',
  })
  @IsEnum(PlanType)
  planType: PlanType;
}
