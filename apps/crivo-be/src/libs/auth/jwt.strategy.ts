import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { PrismaService } from '../prisma/prisma.service';

export interface JwtPayload {
  sub: string;
  email?: string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  realm_access?: { roles: string[] };
  iat: number;
  exp: number;
  iss: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const jwksUri = config.getOrThrow<string>('KEYCLOAK_JWKS_URI');
    const issuer = config.getOrThrow<string>('KEYCLOAK_ISSUER');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
      issuer,
      algorithms: ['RS256'],
    });
  }

  /**
   * Just-in-Time Provisioning: if the user does not exist in our DB,
   * create them automatically from the Keycloak JWT claims.
   * The user is created without a company — they must call
   * POST /onboarding/setup-company to complete the setup.
   */
  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const existing = await this.prisma.user.findUnique({
      where: { keycloakId: payload.sub },
    });

    if (!existing) {
      await this.prisma.user.create({
        data: {
          keycloakId: payload.sub,
          email:
            payload.email ??
            payload.preferred_username ??
            `${payload.sub}@unknown`,
          firstname: payload.given_name ?? null,
          lastname: payload.family_name ?? null,
          role: 'OWNER',
        },
      });
    }

    return payload;
  }
}
