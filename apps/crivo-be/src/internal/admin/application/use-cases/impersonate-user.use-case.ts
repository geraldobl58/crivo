import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../../../libs/prisma/prisma.service';
import { KeycloakAdminService } from '../../../../libs/keycloak/keycloak-admin.service';

@Injectable()
export class ImpersonateUserUseCase {
  private readonly logger = new Logger(ImpersonateUserUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly keycloak: KeycloakAdminService,
  ) {}

  async execute(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          where: { role: 'OWNER' },
          select: { id: true, email: true, keycloakId: true },
          take: 1,
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found`);
    }

    const owner = company.users[0];
    if (!owner) {
      throw new BadRequestException(
        `Company "${company.name}" has no owner user`,
      );
    }

    const { accessToken, expiresIn } = await this.keycloak.exchangeToken(
      owner.keycloakId,
    );

    this.logger.warn(
      `Admin impersonating user ${owner.email} (company: ${company.name})`,
    );

    return {
      accessToken,
      expiresIn,
      impersonatedUser: {
        id: owner.id,
        email: owner.email,
        keycloakId: owner.keycloakId,
      },
      company: {
        id: company.id,
        name: company.name,
      },
    };
  }
}
