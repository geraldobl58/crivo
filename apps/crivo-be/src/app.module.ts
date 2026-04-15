import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';

import { PrismaModule } from './libs/prisma/prisma.module';
import { AuthModule } from './libs/auth/auth.module';
import { JwtAuthGuard } from './libs/auth/jwt-auth.guard';
import { TenantModule } from './libs/tenant/tenant.module';
import { CompanyModule } from './internal/companies/company.module';
import { UserModule } from './internal/users/user.module';
import { PlanModule } from './internal/plans/plan.module';
import { SubscriptionModule } from './internal/subscriptions/subscription.module';
import { OnboardingModule } from './internal/onboarding/onboarding.module';
import { AuthInternalModule } from './internal/auth/auth.module';
import { StripeModule } from './internal/stripe/stripe.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const isProduction = config.get<string>('NODE_ENV') === 'production';

        return {
          pinoHttp: {
            transport: !isProduction
              ? {
                  target: 'pino-pretty',
                  options: {
                    colorize: true,
                    levelFirst: true,
                    translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                    ignore: 'pid,hostname',
                    singleLine: true,
                    messageFormat: '{req.method} {req.url} - {msg}',
                  },
                }
              : undefined,
            level: !isProduction ? 'debug' : 'info',
            autoLogging: {
              ignore: (req) => req.url === '/health' || req.url === '/metrics',
            },
            serializers: {
              req(req) {
                return {
                  id: req.id,
                  method: req.method,
                  url: req.url,
                  query: req.query,
                  params: req.params,
                  // Não logar o body em produção por segurança
                  ...(!isProduction && {
                    body: req.raw.body,
                  }),
                };
              },
              res(res) {
                return {
                  statusCode: res.statusCode,
                };
              },
            },
          },
        };
      },
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 segundos
        limit: 100, // 100 requisições por minuto
      },
    ]),
    PrismaModule,
    AuthModule,
    TenantModule,
    CompanyModule,
    UserModule,
    PlanModule,
    SubscriptionModule,
    OnboardingModule,
    AuthInternalModule,
    StripeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
