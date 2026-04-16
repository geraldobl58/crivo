import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../libs/prisma/prisma.service';
import { StripeService } from '../../stripe.service';

export interface CreatePortalSessionInput {
  companyId: string;
}

export interface CreatePortalSessionResult {
  url: string;
}

@Injectable()
export class CreatePortalSessionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
  ) {}

  async execute(
    input: CreatePortalSessionInput,
  ): Promise<CreatePortalSessionResult> {
    const company = await this.prisma.company.findUnique({
      where: { id: input.companyId },
      select: { stripeCustomerId: true },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    if (!company.stripeCustomerId) {
      throw new BadRequestException(
        'Empresa não possui assinatura ativa. Complete o onboarding primeiro.',
      );
    }

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    const session = await this.stripe.createBillingPortalSession({
      customerId: company.stripeCustomerId,
      returnUrl: `${frontendUrl}/dashboard`,
    });

    return { url: session.url };
  }
}
