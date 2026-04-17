# Crivo — Backend API

API multi-tenant SaaS para gestão contábil com autenticação via Keycloak, pagamentos via Stripe e notificações por email.

---

## Stack

| Camada           | Tecnologia                                        |
| ---------------- | ------------------------------------------------- |
| Framework        | NestJS 11                                         |
| ORM              | Prisma 7 + PrismaPg (PostgreSQL driver nativo)    |
| Banco de dados   | PostgreSQL 16                                     |
| Autenticação     | Keycloak 26 — OpenID Connect (JWT RS256 via JWKS) |
| Pagamentos       | Stripe (subscriptions + webhooks + portal)        |
| Email            | Nodemailer (Mailtrap em dev)                      |
| API Gateway      | Kong 3.9 (DB-less / declarativo)                  |
| Logs             | Pino (pino-pretty em dev)                         |
| Documentação API | Swagger (OpenAPI) em `/docs`                      |
| Infraestrutura   | Docker Compose                                    |

---

## Pré-requisitos

- **Node.js** >= 20
- **Docker** e **Docker Compose**
- Conta no **Stripe** (test mode)
- Acesso ao **Mailtrap** (sandbox)

---

## Setup rápido

```bash
# 1. Subir PostgreSQL + Keycloak
docker compose up -d

# 2. Instalar dependências
cd apps/crivo-be && npm install

# 3. Copiar e preencher variáveis de ambiente
cp .env.example .env

# 4. Aplicar migrations e seed
npm run prisma:migrate
npm run prisma:seed

# 5. Iniciar em dev
npm run start:dev
```

| Recurso        | URL                                   |
| -------------- | ------------------------------------- |
| API            | `http://localhost:8000`               |
| Swagger        | `http://localhost:8000/docs`          |
| Keycloak Admin | `http://localhost:8080` (admin/admin) |
| Prisma Studio  | `npm run prisma:studio`               |

---

## Variáveis de ambiente

```env
# ---------- Database ----------
DATABASE_URL="postgresql://crivo:crivo_password@localhost:5432/crivo_db"

# ---------- Keycloak ----------
KEYCLOAK_BASE_URL="http://localhost:8080"
KEYCLOAK_REALM="crivo"
KEYCLOAK_CLIENT_ID="crivo-api"
KEYCLOAK_CLIENT_SECRET="<secret do client>"
KEYCLOAK_JWKS_URI="http://localhost:8080/realms/crivo/protocol/openid-connect/certs"
KEYCLOAK_ISSUER="http://localhost:8080/realms/crivo"

# ---------- Stripe ----------
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_BASIC="price_... ou prod_..."
STRIPE_PRICE_PROFESSIONAL="price_... ou prod_..."
STRIPE_PRICE_ENTERPRISE="price_... ou prod_..."

# ---------- Mailtrap ----------
MAILTRAP_HOST="sandbox.smtp.mailtrap.io"
MAILTRAP_PORT=587
MAILTRAP_USER="<user>"
MAILTRAP_PASSWORD="<password>"

# ---------- App ----------
PORT=3333
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

---

## Arquitetura

```
apps/crivo-be/
├── prisma/                    # Schema, migrations, seed
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── main.ts                # Bootstrap (Swagger, CORS, pipes)
│   ├── app.module.ts          # Root module — registra todos os módulos
│   ├── libs/                  # Módulos globais (@Global)
│   │   ├── auth/              # JwtStrategy, JwtAuthGuard, @Public()
│   │   ├── guards/            # RolesGuard, PlanLimitGuard, decorators
│   │   ├── keycloak/          # KeycloakAdminService (CRUD users, token exchange)
│   │   ├── mail/              # MailService + templates HTML
│   │   ├── prisma/            # PrismaService + tenant extension
│   │   ├── tenant/            # TenantInterceptor, @Tenant(), AsyncLocalStorage
│   │   └── http/              # DTOs compartilhados (ErrorResponseDto)
│   └── internal/              # Módulos de domínio
│       ├── admin/             # Dashboard admin (cross-tenant, role SUPPORT)
│       ├── auth/              # POST /auth/dev-token (dev only)
│       ├── companies/         # CRUD empresas (tenant-scoped)
│       ├── onboarding/        # POST /onboarding/setup-company
│       ├── plans/             # CRUD planos (GET público, POST/PATCH admin)
│       ├── stripe/            # Checkout, webhook, portal
│       ├── subscriptions/     # GET /subscriptions/me + invoices
│       └── users/             # CRUD usuários (tenant-scoped)
└── docs/                      # Documentação técnica detalhada
```

### Padrões

- **Clean Architecture por módulo** — `domain/` → `application/` → `infrastructure/`
- **Repository Pattern** — Interfaces no domain, implementação Prisma no infrastructure
- **Use Cases** — Cada operação é um `@Injectable()` com método `execute()`
- **Módulos @Global** — `PrismaModule`, `AuthModule`, `TenantModule`, `KeycloakAdminModule`, `MailModule`
- **Decorators** — `@Public()`, `@Roles()`, `@Tenant()`, `@PlanResource()`

---

## Autenticação

```
Frontend → Keycloak (login) → JWT (RS256)
       ↓
Backend → JwtAuthGuard → JwtStrategy (JWKS validation)
       ↓
JIT Provisioning: se o user não existe no Postgres, cria automaticamente
```

1. O usuário se registra/loga no **Keycloak** (tela de login customizada)
2. Recebe um **JWT** assinado com RS256
3. Toda request ao backend inclui `Authorization: Bearer <token>`
4. `JwtAuthGuard` (global) valida o token via JWKS
5. `JwtStrategy.validate()` faz **JIT Provisioning** — cria o user no Postgres se não existir
6. O `request.user` fica populado com o payload JWT (`sub`, `email`, etc.)

### Decoradores úteis

```typescript
@Public()           // Pula auth (endpoints públicos)
@Roles('OWNER')     // Exige role específica (via RolesGuard)
@Tenant('companyId') // Extrai campo do TenantContext
```

---

## Multi-tenancy

O sistema usa **shared schema** com isolamento por `companyId`.

```
Request → JwtAuthGuard → TenantInterceptor → Controller
                              ↓
                    Busca user no Postgres
                    Resolve companyId, planType
                    Armazena em AsyncLocalStorage
                              ↓
                    TenantPrismaService filtra por companyId
```

- **TenantInterceptor** — Resolve `companyId` do user autenticado
- **@Tenant('companyId')** — Param decorator que extrai do context
- **TenantPrismaService** — Prisma client com filtro automático de companyId
- **AsyncLocalStorage** — Context disponível em qualquer camada sem prop drilling

> O módulo Admin (`/admin/*`) **NÃO** usa TenantInterceptor — acesso cross-tenant com role `SUPPORT`.

---

## Stripe — Pagamentos

### Fluxo de onboarding

```
POST /onboarding/setup-company
  ├── Cria Stripe Customer
  ├── Cria Company + Subscription (INCOMPLETE) + link User [transação]
  ├── Cria Checkout Session
  ├── Envia email de boas-vindas
  └── Retorna { checkoutUrl } → redirect para Stripe
```

### Webhooks

```
POST /stripe/webhook (@Public, @SkipThrottler)
```

| Evento Stripe                   | Ação                                              |
| ------------------------------- | ------------------------------------------------- |
| `checkout.session.completed`    | Salva `stripeSubscriptionId` na Subscription      |
| `customer.subscription.created` | Cria/atualiza Subscription (TRIALING ou ACTIVE)   |
| `customer.subscription.updated` | Atualiza status, período, cancel flags            |
| `customer.subscription.deleted` | CANCELED + email de cancelamento ao owner         |
| `invoice.payment_succeeded`     | Cria/atualiza Invoice PAID + email de confirmação |
| `invoice.payment_failed`        | Subscription → PAST_DUE + email de alerta         |

### Customer Portal

```
POST /stripe/portal → { url } → redirect para Stripe Billing Portal
```

O portal permite ao usuário trocar plano, atualizar cartão e cancelar — os webhooks capturam todas as mudanças.

---

## Email — Notificações transacionais

| Trigger                         | Email                         |
| ------------------------------- | ----------------------------- |
| Onboarding concluído            | Boas-vindas + próximos passos |
| `invoice.payment_succeeded`     | Confirmação de pagamento      |
| `invoice.payment_failed`        | Alerta + link para resolver   |
| `customer.subscription.deleted` | Confirmação de cancelamento   |
| Trial expirando (D-3)           | Alerta (template pronto)      |

- **Best-effort** — falhas de email nunca bloqueiam o fluxo principal
- **Templates HTML inline** — sem engine de template externo
- **Mailtrap** em dev → trocar por SendGrid/SES/Resend em produção

---

## Admin Dashboard

Endpoints cross-tenant protegidos por `@Roles('SUPPORT')`.

| Método | Endpoint                           | Descrição                           |
| ------ | ---------------------------------- | ----------------------------------- |
| `GET`  | `/admin/metrics`                   | Métricas (empresas, users, receita) |
| `GET`  | `/admin/companies`                 | Lista todas empresas (paginado)     |
| `GET`  | `/admin/companies/:id`             | Detalhe com users + subscription    |
| `POST` | `/admin/companies/:id/impersonate` | Token JWT do owner via Keycloak     |

A impersonação usa **Keycloak Token Exchange** (RFC 8693) — requer configuração no realm.

---

## Planos e Limites

| Plano        | Preço/mês    | Trial | Max Usuários | Max Empresas |
| ------------ | ------------ | ----- | ------------ | ------------ |
| TRIAL        | Gratuito     | 1 dia | 1            | 1            |
| BASIC        | R$ 19,90     | —     | 1            | 1            |
| PROFESSIONAL | R$ 49,90     | —     | 3            | 3            |
| ENTERPRISE   | Sob consulta | —     | Ilimitado    | Ilimitado    |

O `PlanLimitGuard` impede criação de usuários ou sub-empresas acima do limite do plano ativo.

---

## Roles

| Role      | Cria usuário | Edita empresa | Leitura | Admin Dashboard |
| --------- | ------------ | ------------- | ------- | --------------- |
| `OWNER`   | ✅           | ✅            | ✅      | ❌              |
| `ADMIN`   | ✅           | ✅            | ✅      | ❌              |
| `USER`    | ❌           | ❌            | ✅      | ❌              |
| `SUPPORT` | ✅           | ✅            | ✅      | ✅              |

---

## Endpoints — Resumo

### Públicos

| Método | Endpoint          | Descrição            |
| ------ | ----------------- | -------------------- |
| `GET`  | `/plans`          | Lista planos ativos  |
| `GET`  | `/plans/:id`      | Detalhe de um plano  |
| `POST` | `/stripe/webhook` | Webhook Stripe       |
| `POST` | `/auth/dev-token` | Token dev (dev only) |

### Autenticados (JWT)

| Método   | Endpoint                    | Tenant | Descrição                 |
| -------- | --------------------------- | ------ | ------------------------- |
| `POST`   | `/onboarding/setup-company` | ❌     | Onboarding (cria empresa) |
| `POST`   | `/stripe/checkout`          | ✅     | Upgrade de plano          |
| `POST`   | `/stripe/portal`            | ✅     | Portal do cliente         |
| `GET`    | `/subscriptions/me`         | ✅     | Assinatura ativa          |
| `GET`    | `/subscriptions/invoices`   | ✅     | Faturas (paginado)        |
| `GET`    | `/companies`                | ✅     | Lista empresas do tenant  |
| `GET`    | `/companies/:id`            | ✅     | Detalhe empresa           |
| `POST`   | `/companies`                | ✅     | Criar sub-empresa         |
| `PATCH`  | `/companies/:id`            | ✅     | Atualizar empresa         |
| `DELETE` | `/companies/:id`            | ✅     | Deletar empresa           |
| `GET`    | `/users`                    | ✅     | Lista usuários do tenant  |
| `GET`    | `/users/:id`                | ✅     | Detalhe usuário           |
| `POST`   | `/users`                    | ✅     | Criar usuário             |
| `PATCH`  | `/users/:id`                | ✅     | Atualizar usuário         |
| `DELETE` | `/users/:id`                | ✅     | Deletar usuário           |

### Admin (role SUPPORT)

| Método | Endpoint                           | Descrição               |
| ------ | ---------------------------------- | ----------------------- |
| `GET`  | `/admin/metrics`                   | Métricas da plataforma  |
| `GET`  | `/admin/companies`                 | Lista todas as empresas |
| `GET`  | `/admin/companies/:id`             | Detalhe cross-tenant    |
| `POST` | `/admin/companies/:id/impersonate` | Impersonação            |

---

## Scripts disponíveis

```bash
# Desenvolvimento
npm run start:dev          # NestJS em watch mode
npm run start:debug        # Debug + watch
npm run lint               # ESLint com --fix

# Prisma
npm run prisma:migrate     # Aplicar migrations
npm run prisma:seed        # Popular banco (4 planos)
npm run prisma:studio      # UI visual do banco
npm run prisma:reset       # Resetar banco + re-seed
npm run prisma:generate    # Gerar Prisma Client

# Testes
npm run test               # Unit tests
npm run test:watch         # Watch mode
npm run test:cov           # Coverage
npm run test:e2e           # End-to-end

# Build
npm run build              # Compilar para dist/
npm run start:prod         # Rodar build de produção
```

---

## Infraestrutura (Docker)

```bash
docker compose up -d       # PostgreSQL + Keycloak + Kong
docker compose down        # Parar tudo
docker compose logs -f     # Seguir logs
```

| Serviço    | Container            | Porta       | Credenciais / Descrição        |
| ---------- | -------------------- | ----------- | ------------------------------ |
| PostgreSQL | `crivo-postgres-dev` | 5432        | crivo / crivo_password         |
| Keycloak   | `crivo-auth-dev`     | 8080        | admin / admin                  |
| Kong Proxy | `crivo-kong-dev`     | 8000 / 8443 | Gateway (frontend aponta aqui) |
| Kong Admin | `crivo-kong-dev`     | 8001        | API de gerenciamento (dev)     |
| Konga UI   | `crivo-konga-dev`    | 1337        | Admin visual do Kong           |

O Keycloak usa o mesmo PostgreSQL (database `crivo_keycloak`). O `init-databases.sh` cria ambos os databases automaticamente.

### Kong API Gateway

O Kong roda em modo **DB-less** (sem banco próprio). Config em `kong/kong.yml`.

```
Frontend / Apps  ──→  Kong :8000  ─┬─→  /api/*   ─→  NestJS :3333
                                   ├─→  /docs    ─→  NestJS :3333
                                   └─→  /auth/*  ─→  Keycloak :8080
```

**Plugins ativos:** rate limiting (120/min API, 30/min auth), CORS, bot detection, security headers, correlation ID, request size limit.

```bash
# Testar via Kong
curl http://localhost:8000/api/plans
curl http://localhost:8000/api/health

# Admin API
curl http://localhost:8001/status | jq

# Konga UI (admin visual)
open http://localhost:1337
```

---

## Jornada do usuário

```
1. Registro no Keycloak (email, nome, senha)
       ↓
2. Primeira request → JIT Provisioning (cria user no Postgres)
       ↓
3. POST /onboarding/setup-company (empresa + plano)
       ↓
4. Redirect → Stripe Checkout (pagamento)
       ↓
5. Webhook → Subscription ACTIVE → email boas-vindas
       ↓
6. Uso diário: CRUD users, companies (tenant-scoped)
       ↓
7. Upgrade/cancelamento: POST /stripe/portal
```

---

## Modelo de dados

```
User ──────────────── Company ──────── Subscription ──── Plan
 │                      │                    │
 │ keycloakId           │ stripeCustomerId   │ stripeSubscriptionId
 │ email                │ parentCompanyId    │ status
 │ role                 │                    │ currentPeriodEnd
 │ companyId ──────────→│                    │
                        │                    └──── Invoice[]
                        │                           │ stripeInvoiceId
                        └── ChartOfAccount[]        │ status
                             │ code, name, type     │ amountPaid
                             │ companyId
                             └── children[] (hierarquia)
```

Enums principais: `UserRole`, `PlanType`, `SubscriptionStatus`, `InvoiceStatus`

---

## Segurança

- **JWT RS256** — Tokens assinados pelo Keycloak, validados via JWKS
- **API Gateway** — Kong: rate limiting, bot detection, security headers
- **Rate Limiting** — Kong (120/min) + NestJS throttler (100/min) = dupla camada
- **Webhook Verification** — `stripe.webhooks.constructEvent()` valida assinatura
- **Input Validation** — `class-validator` global com `whitelist: true`
- **Tenant Isolation** — Queries filtradas por `companyId` automaticamente
- **CORS** — Centralizado no Kong + fallback no NestJS
- **Security Headers** — X-Frame-Options, X-Content-Type-Options, etc. (via Kong)
- **Raw Body** — Preservado apenas para `/stripe/webhook`

---

## Documentação detalhada

| Arquivo                                             | Conteúdo                                   |
| --------------------------------------------------- | ------------------------------------------ |
| [01-SETUP.md](docs/01-SETUP.md)                     | Infraestrutura, Keycloak, Stripe, env vars |
| [02-ARCHITECTURE.md](docs/02-ARCHITECTURE.md)       | Clean Architecture, multi-tenancy, guards  |
| [03-API.md](docs/03-API.md)                         | Referência completa de endpoints           |
| [04-USER-JOURNEY.md](docs/04-USER-JOURNEY.md)       | Fluxo onboarding → autenticação → uso      |
| [05-TESTING.md](docs/05-TESTING.md)                 | Testes manuais: guards, limites, tenant    |
| [06-STRIPE.md](docs/06-STRIPE.md)                   | Produtos, prices, webhooks do Stripe       |
| [07-PLANS.md](docs/07-PLANS.md)                     | Plans CRUD e decisões de design            |
| [08-SUBSCRIPTIONS.md](docs/08-SUBSCRIPTIONS.md)     | Subscriptions API e faturas                |
| [09-KEYCLOAK-ADMIN.md](docs/09-KEYCLOAK-ADMIN.md)   | Keycloak Admin Service, CRUD users         |
| [10-CUSTOMER-PORTAL.md](docs/10-CUSTOMER-PORTAL.md) | Stripe Customer Portal                     |
| [11-MAIL.md](docs/11-MAIL.md)                       | Email transacional, templates, Mailtrap    |
| [12-ADMIN-DASHBOARD.md](docs/12-ADMIN-DASHBOARD.md) | Admin Dashboard, métricas, impersonação    |
| [13-API-GATEWAY.md](docs/13-API-GATEWAY.md)         | Kong API Gateway, rotas, plugins           |
| [ROADMAP.md](docs/ROADMAP.md)                       | Roadmap com todas as fases e status        |
