import { ApiProperty } from '@nestjs/swagger';

export class CheckoutSessionResponseDto {
  @ApiProperty({
    description: 'URL do Stripe Checkout para redirecionar o usuário',
    example: 'https://checkout.stripe.com/pay/cs_test_...',
  })
  url: string;
}
