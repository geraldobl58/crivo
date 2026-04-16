import { ApiProperty } from '@nestjs/swagger';

export class PortalSessionResponseDto {
  @ApiProperty({
    description: 'URL do Stripe Customer Portal para redirecionar o usuário',
    example: 'https://billing.stripe.com/p/session/test_...',
  })
  url: string;
}
