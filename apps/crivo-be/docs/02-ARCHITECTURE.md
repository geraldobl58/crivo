# Arquitetura do Sistema

## Stack

| Camada         | Tecnologia                               |
| -------------- | ---------------------------------------- |
| Framework      | NestJS 11                                |
| ORM            | Prisma 7 + PrismaPg adapter (PostgreSQL) |
| Autenticação   | Keycloak 26 — OpenID Connect (JWT RS256) |
| Pagamento      | Stripe (subscriptions + webhooks)        |
| Infraestrutura | Docker Compose                           |

---

## 1. Estrutura do Projeto

Clean Architecture + DDD por módulo (`src/internal/<módulo>/`):

```
src/
├── app.module.ts
├── libs/
│   ├── auth/
│   │   ├── auth.module.ts           # PassportModule + JwtStrategy
│   │   ├── jwt.strategy.ts          # Validação JWKS / RS256
│   │   ├── jwt-auth.guard.ts        # Guard global (respeita @Public)
│   │   └── public.decorator.ts      # @Public() — abre a rota
│   ├── prisma/
│   │   ├── prisma.service.ts        # PrismaClient singleton
│   │   ├── prisma.module.ts         # @Global()
│   │   └── prisma-tenant.extension.ts  # Safety-net: WHERE companyId automático
│   ├── tenant/
│   │   ├── tenant.context.ts        # Interface TenantContext
│   │   ├── tenant.service.ts        # REQUEST-scoped — armazena contexto
│   │   ├── tenant.interceptor.ts    # Resolve keycloakId → User + Company + Plan
│   │   ├── tenant.decorator.ts      # @Tenant('companyId') param decorator
│   │   ├── tenant-prisma.service.ts # Prisma com filtro automático de tenant
│   │   └── tenant.module.ts         # @Global()
│   └── guards/
│       ├── plan-limit.guard.ts      # PlanLimitGuard — verifica limites do plano via DB
│       ├── plan-resource.decorator.ts # @PlanResource('users' | 'company')
│       ├── roles.guard.ts           # RolesGuard — verifica role via DB (request.user.sub)
│       └── roles.decorator.ts       # @Roles('ADMIN', 'OWNER', 'SUPPORT')
└── internal/
    ├── auth/                        # POST /auth/dev-token (dev only)
    ├── onboarding/                  # POST /onboarding (público)
    ├── companies/                   # CRUD /companies
    └── users/                       # CRUD /users
```

### Camadas por módulo

```
src/internal/<módulo>/
├── domain/
│   ├── entities/       # Entidades de domínio (get/set, sem frameworks)
│   ├── enums/
│   └── repository/     # Interface do repositório
├── application/
│   └── use-cases/      # Regras de negócio, sem infraestrutura
└── infrastructure/
    ├── prisma/          # Implementação do repositório
    └── http/
        ├── dtos/        # Validação de entrada (class-validator)
        └── *.controller.ts
```

### Regras de Dependência

```
Controller → UseCase → Entity / Repository Interface
                           ↑
                  PrismaRepository (DI token)
```

A camada `domain/` **não importa** NestJS, Prisma nem qualquer framework.

---

## 2. Multi-tenancy (Shared Schema)

Todas as empresas compartilham o mesmo banco. Isolamento por `companyId`.

```
JWT (Keycloak)  →  JwtAuthGuard  →  Guards (DB check)  →  TenantInterceptor  →  TenantContext
{ sub: "kc-id" }    (valida JWKS)    RolesGuard             (resolve user+company)   { companyId, userId, planType }
                                     PlanLimitGuard              ↓
                                     (usam sub do JWT)    @Tenant() Decorator
```

> **Ordem de execução (NestJS):** Guards → Interceptors. Por isso `RolesGuard` e `PlanLimitGuard` **não dependem** do `TenantInterceptor` — eles resolvem o usuário diretamente via banco usando `request.user.sub`.

### Camadas de proteção

| Camada                  | Responsabilidade                                          |
| ----------------------- | --------------------------------------------------------- |
| **JwtAuthGuard**        | Valida assinatura JWT via JWKS, bloqueia tokens inválidos |
| **JwtAuthGuard**        | Valida assinatura JWT via JWKS, bloqueia tokens inválidos |
| **RolesGuard**          | Verifica `user.role` no DB via `request.user.sub`         |
| **PlanLimitGuard**      | Verifica limites do plano no DB via `request.user.sub`    |
| **TenantInterceptor**   | Resolve `keycloakId → User → Company → Plan`              |
| **@Tenant() Decorator** | Injeta `companyId` nos parâmetros do controller           |
| **Use Cases**           | Verificam ownership (`company.id === companyId`)          |
| **Repository**          | Filtra queries por `companyId`                            |
| **Prisma Extension**    | Safety-net — injeta `WHERE companyId` em todas as queries |

### Safety-net automático (`prisma-tenant.extension.ts`)

| Operação                         | Comportamento                                |
| -------------------------------- | -------------------------------------------- |
| `findMany`, `count`, `aggregate` | Injeta `WHERE companyId = ?` automaticamente |
| `findUnique`                     | Valida ownership após busca                  |
| `create`                         | Força `companyId` no data                    |
| `update`, `delete`               | Pre-check de ownership antes de executar     |

Modelos protegidos: `User`, `Subscription`, `ChartOfAccount`.

---

## 3. Autenticação (Keycloak JWT)

Todas as rotas são **privadas por padrão**. Para abrir uma rota, use `@Public()`.

```
Request HTTP
Authorization: Bearer <jwt-token>
        │
        ▼
JwtAuthGuard (Global)
  ├── @Public() → permite sem token
  ├── Extrai Bearer token
  ├── Valida assinatura via JWKS (RS256)
  └── Popula request.user com payload JWT
        │
        ▼
TenantInterceptor
  ├── Lê request.user.sub (keycloakId validado)
  ├── Busca User → Company → Subscription → Plan
  └── Popula request.tenantContext
```

**Rotas públicas:**

| Endpoint               | Motivo                                           |
| ---------------------- | ------------------------------------------------ |
| `POST /onboarding`     | Cadastro inicial (usuário ainda não tem empresa) |
| `POST /auth/dev-token` | Obter JWT local (bloqueado em produção)          |

---

## 4. Entidades de Domínio

As entidades usam **campos privados com `get`/`set` públicos**, garantindo encapsulamento:

```typescript
export class CompanyEntity {
  private _name: string;

  get name(): string {
    return this._name;
  }
  set name(value: string) {
    this._name = value;
  }
}
```

Campos imutáveis (como `id`, `taxId`, `keycloakId`) expõem apenas `get`.

---

## 5. Enforcement de Limites e Permissões (SaaS Shield)

### RolesGuard

Restringe rotas por papel do usuário, consultado no banco via `request.user.sub` (keycloakId do JWT).

Uso:

```typescript
@Roles('ADMIN', 'OWNER', 'SUPPORT')
@UseGuards(RolesGuard)
@Post()
create(...) {}
```

| Role      | Descrição                                            |
| --------- | ---------------------------------------------------- |
| `OWNER`   | Dono da conta (PJ)                                   |
| `ADMIN`   | Administrador da empresa                             |
| `USER`    | Usuário comum (somente leitura em recursos críticos) |
| `SUPPORT` | Suporte do sistema                                   |

### PlanLimitGuard

Aplicado em endpoints de criação de recursos limitados. Consulta o banco via `request.user.sub` — **não depende do `TenantInterceptor`**.

Uso (com `@PlanResource` para declarar o recurso):

```typescript
@UseGuards(RolesGuard, PlanLimitGuard)
@PlanResource('users') // ou 'company'
@Post()
create(...) {}
```

| Plano         | Max Usuários   | Max Empresas   |
| ------------- | -------------- | -------------- |
| Trial (1 dia) | 1              | 1              |
| Basic         | 1              | 1              |
| Professional  | 3              | 3              |
| Enterprise    | Ilimitado (−1) | Ilimitado (−1) |

Fluxo do guard:

1. Lê `request.user.sub` (keycloakId, set pelo `JwtAuthGuard`)
2. Busca `User → Company → Subscription → Plan` no banco
3. Verifica status da assinatura (`ACTIVE` / `TRIALING`)
4. Para `'users'`: conta usuários da empresa e compara com `plan.maxUsers`
5. Para `'company'`: enforcement pendente (requer `parentCompanyId` no schema)

> Lança `ForbiddenException` detalhada se o limite for atingido.

---

## 6. Rate Limiting

`ThrottlerModule` global: **100 req / 60s por IP** → `429 Too Many Requests`.

---

## 7. Modelo de Dados

```
Company (1) ──── (N) User
    │
    ├── (1) Subscription ──── (1) Plan
    ├── (N) Invoice
    └── (N) ChartOfAccount (hierarquia self-referencial)
```

| Entidade         | Descrição                                               |
| ---------------- | ------------------------------------------------------- |
| `Company`        | Tenant da plataforma. Contém `stripeCustomerId`         |
| `User`           | Membro de empresa. `keycloakId` vinculado ao Keycloak   |
| `Plan`           | Plano de assinatura com limites de uso                  |
| `Subscription`   | Estado atual. Sincronizado via webhooks Stripe          |
| `Invoice`        | Fatura por ciclo de cobrança                            |
| `ChartOfAccount` | Plano de Contas contábil. `@@unique([code, companyId])` |

**Enums:** `UserRole`, `PlanType`, `SubscriptionStatus`, `InvoiceStatus`, `AccountType`
