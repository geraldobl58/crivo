import { ApiProperty } from '@nestjs/swagger';

class SetupCompanyResponse {
  @ApiProperty({
    description: 'ID da empresa criada',
    example: '550e8400-e29b-41d4-a716-446655440003',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da empresa',
    example: 'Minha Empresa LTDA',
  })
  name: string;
}

class SetupSubscriptionResponse {
  @ApiProperty({
    description: 'ID da assinatura criada',
    example: '550e8400-e29b-41d4-a716-446655440004',
  })
  id: string;

  @ApiProperty({
    description: 'Status inicial da assinatura',
    example: 'INCOMPLETE',
  })
  status: string;
}

export class OnboardCompanyResponseDto {
  @ApiProperty({ type: SetupCompanyResponse })
  company: SetupCompanyResponse;

  @ApiProperty({ type: SetupSubscriptionResponse })
  subscription: SetupSubscriptionResponse;

  @ApiProperty({
    description:
      'URL do Stripe Checkout para completar o pagamento (null para plano Trial)',
    example: 'https://checkout.stripe.com/pay/cs_test_...',
    nullable: true,
  })
  checkoutUrl: string | null;
}
