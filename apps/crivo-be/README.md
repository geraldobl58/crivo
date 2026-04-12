# Crivo Backend

API backend do Crivo — plataforma SaaS multi-tenant com autenticação via Keycloak e pagamento recorrente via Stripe.

## Stack

- **NestJS 11** — Framework HTTP
- **Prisma 7** — ORM (PostgreSQL)
- **Keycloak 26.5** — Identity & Access Management (OpenID Connect)
- **Stripe** — Pagamento recorrente (subscriptions)
- **Docker Compose** — Infraestrutura local

---

## Pré-requisitos

- Node.js >= 20
- Docker & Docker Compose
- Conta Stripe (sandbox/test)

---

## 1. Subindo a infraestrutura

Na raiz do monorepo:

```bash
docker compose up -d
```

Isso sobe:

| Serviço    | URL                     | Credenciais                |
| ---------- | ----------------------- | -------------------------- |
| PostgreSQL | `localhost:5432`        | `crivo` / `crivo_password` |
| Keycloak   | `http://localhost:8080` | `admin` / `admin`          |

Bancos criados automaticamente:

- `crivo_keycloak` — dados do Keycloak
- `crivo_db` — dados da aplicação

---

## 2. Configuração do Keycloak

### 2.1 Acessar o Admin Console

1. Abra `http://localhost:8080`
2. Login com `admin` / `admin`

### 2.2 Criar o Realm

1. No menu lateral, clique em **Manage realms** → **Create realm**
2. **Realm name:** `crivo`
3. **Enabled:** On
4. Clique em **Create**

### 2.3 Criar o Client `crivo-api` (Backend — confidential)

Este client é usado pelo backend NestJS para validar tokens e acessar a Admin API do Keycloak.

1. Vá em **Clients** → **Create client**
2. **General Settings:**
   - **Client ID:** `crivo-api`
   - **Client type:** OpenID Connect
3. **Capability config:**
   - **Client authentication:** `On`
   - **Authorization:** `On`
   - **Authentication flow:**
     - ✅ Standard flow
     - ✅ Direct access grants
     - ✅ Service account roles
4. Clique em **Save**
5. Vá na aba **Credentials** e copie o **Client Secret**

#### Configurar Service Account Roles

Para que o backend possa gerenciar usuários no Keycloak:

1. Vá na aba **Service account roles**
2. Clique em **Assign role**
3. Filtre por **Filter by clients**
4. Adicione as roles:
   - `realm-management` → `manage-users`
   - `realm-management` → `view-users`
   - `realm-management` → `manage-realm`

### 2.4 Criar o Client `crivo-web` (Frontend — public)

Este client é usado pelo frontend Next.js para autenticação via OIDC (Authorization Code Flow + PKCE).

1. Vá em **Clients** → **Create client**
2. **General Settings:**
   - **Client ID:** `crivo-web`
   - **Client type:** OpenID Connect
3. **Capability config:**
   - **Client authentication:** `Off` (public client)
   - **Authorization:** `Off`
   - **Authentication flow:**
     - ✅ Standard flow
     - ✅ Direct access grants
4. Clique em **Save**
5. Vá na aba **Settings** → **Access settings:**
   - **Root URL:** `http://localhost:3000`
   - **Home URL:** `http://localhost:3000`
   - **Valid redirect URIs:** `http://localhost:3000/*`
   - **Valid post logout redirect URIs:** `http://localhost:3000/*`
   - **Web origins:** `http://localhost:3000`

### 2.5 Criar Realm Roles

1. Vá em **Realm roles** → **Create role**
2. Crie as seguintes roles:

| Role      | Descrição                |
| --------- | ------------------------ |
| `owner`   | Dono da conta (PJ)       |
| `admin`   | Administrador da empresa |
| `user`    | Usuário comum            |
| `support` | Suporte do sistema       |

### 2.6 Aplicar o Theme customizado

O theme `nexo` já é montado automaticamente via Docker Compose:

```yaml
volumes:
  - ./apps/crivo-auth/themes:/opt/keycloak/themes
```

Para ativar:

1. Vá em **Realm settings** → **Themes**
2. **Login theme:** `nexo`
3. **Email theme:** `nexo`
4. Clique em **Save**

### 2.7 Habilitar registro de usuários

1. Vá em **Realm settings** → **Login**
2. **User registration:** `On`
3. **Email as username:** `On` (opcional)
4. Clique em **Save**

---

## 3. Configuração do Stripe

### 3.1 Criar conta Sandbox

1. Acesse [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Crie uma conta ou use a existente
3. Ative o modo **Sandbox/Test** (banner amarelo no topo)

### 3.2 Copiar as API Keys

1. No dashboard Stripe, vá em **API keys** (canto direito da Home)
2. Copie:
   - **Publishable key:** `pk_test_...`
   - **Secret key:** `sk_test_...`

### 3.3 Criar os Products e Prices

No Stripe, vá em **Product catalog** → **Add product** e crie:

| Product      | Price (BRL/mês) | Price ID (copiar) |
| ------------ | --------------- | ----------------- |
| Trial        | R$ 0,00         | `price_xxx_trial` |
| Basic        | R$ 19,90        | `price_xxx_basic` |
| Professional | R$ 49,90        | `price_xxx_pro`   |
| Enterprise   | Customizado     | `price_xxx_ent`   |

Cada product deve ter:

- **Pricing model:** Recurring
- **Billing period:** Monthly
- **Currency:** BRL

Para o **Trial**, configure dentro do checkout/subscription com `trial_period_days: 1`.

### 3.4 Configurar Webhook

Para receber eventos do Stripe (pagamentos, cancelamentos, etc.):

1. Vá em **Developers** → **Webhooks** → **Add endpoint**
2. **Endpoint URL:** `https://seu-dominio.com/api/stripe/webhook`
   - Para desenvolvimento local, use o [Stripe CLI](https://docs.stripe.com/stripe-cli):
     ```bash
     stripe listen --forward-to localhost:3333/api/stripe/webhook
     ```
3. **Eventos para escutar:**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.finalized`
4. Copie o **Webhook Signing Secret:** `whsec_...`

### 3.5 Instalar o Stripe CLI (desenvolvimento local)

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escutar eventos localmente
stripe listen --forward-to localhost:3333/api/stripe/webhook
```

---

## 4. Variáveis de Ambiente

Crie o arquivo `.env` na raiz de `apps/crivo-be/`:

```env
# ═══════════════════════════════════════════════════════════════
# App
# ═══════════════════════════════════════════════════════════════
PORT=3333
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# ═══════════════════════════════════════════════════════════════
# Database (PostgreSQL)
# ═══════════════════════════════════════════════════════════════
DATABASE_URL=postgresql://crivo:crivo_password@localhost:5432/crivo_db

# ═══════════════════════════════════════════════════════════════
# Keycloak
# ═══════════════════════════════════════════════════════════════
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=crivo
KEYCLOAK_CLIENT_ID=crivo-api
KEYCLOAK_CLIENT_SECRET=<copiar da aba Credentials do client crivo-api>

# JWKS para validação de tokens JWT
KEYCLOAK_JWKS_URI=http://localhost:8080/realms/crivo/protocol/openid-connect/certs
KEYCLOAK_ISSUER=http://localhost:8080/realms/crivo

# ═══════════════════════════════════════════════════════════════
# Stripe
# ═══════════════════════════════════════════════════════════════
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs dos planos (copiar do Stripe Dashboard)
STRIPE_PRICE_TRIAL=price_xxx
STRIPE_PRICE_BASIC=price_xxx
STRIPE_PRICE_PROFESSIONAL=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx
```

---

## 5. Executando o Backend

```bash
cd apps/crivo-be

# Instalar dependências
npm install

# Rodar migrations do Prisma
npm run prisma:migrate

# Iniciar em modo dev
npm run start:dev
```

| Recurso       | URL                          |
| ------------- | ---------------------------- |
| API           | `http://localhost:3333`      |
| Swagger Docs  | `http://localhost:3333/docs` |
| Prisma Studio | `npm run prisma:studio`      |

---

## 6. Arquitetura Técnica

### 6.1 Estrutura do Projeto

O backend segue **Clean Architecture + DDD** por módulo. Cada módulo em `src/internal/<módulo>/` é dividido em três camadas:

```
src/
├── app.module.ts              # Raiz: ThrottlerModule, PrismaModule, módulos de domínio
├── libs/
│   ├── prisma/                # PrismaService (PrismaClient + PrismaPg adapter)
│   └── http/dtos/             # DTOs compartilhados (ex: ErrorResponseDto)
└── internal/
    ├── companies/
    │   ├── domain/
    │   │   ├── entities/      # CompanyEntity — objeto de domínio puro
    │   │   └── repository/    # ICompanyRepository + tipos (interface + dados de entrada/filtros)
    │   ├── application/
    │   │   └── use-cases/     # Um arquivo por caso de uso (Create, GetAll, GetById, Update, Delete)
    │   └── infrastructure/
    │       ├── prisma/        # PrismaCompanyRepository — implementa ICompanyRepository
    │       └── http/
    │           ├── company.controller.ts
    │           └── dtos/      # CreateCompanyDto, UpdateCompanyDto, GetCompaniesQueryDto, CompanyResponseDto
    └── users/
        ├── domain/
        │   ├── entities/      # UserEntity
        │   ├── enums/         # Role enum (OWNER | ADMIN | USER | SUPPORT)
        │   └── repository/    # IUserRepository + tipos
        ├── application/
        │   └── use-cases/     # Create, GetAll, GetById, Update, Delete
        └── infrastructure/
            ├── prisma/        # PrismaUserRepository
            └── http/
                ├── user.controller.ts
                └── dtos/      # CreateUserDto, UpdateUserDto, GetUsersQueryDto, UserResponseDto
```

### 6.2 Regras de Dependência

```
Controller → UseCase → Entity/Repository Interface
                 ↑
         PrismaRepository (implementa a interface — injetado via token DI)
```

- A camada `domain/` não importa nada de NestJS, Prisma ou frameworks externos.
- A camada `application/` depende apenas das interfaces de `domain/`.
- A camada `infrastructure/` é onde vivem os detalhes técnicos (Prisma, HTTP, DTOs).
- Cada módulo registra o repositório com um token de injeção:
  ```typescript
  { provide: COMPANY_REPOSITORY, useClass: PrismaCompanyRepository }
  ```

### 6.3 API Endpoints

#### Empresas — `GET /companies`

| Método   | Endpoint         | Status de Sucesso | Descrição                |
| -------- | ---------------- | ----------------- | ------------------------ |
| `POST`   | `/companies`     | `201 Created`     | Cria uma nova empresa    |
| `GET`    | `/companies`     | `200 OK`          | Lista com paginação      |
| `GET`    | `/companies/:id` | `200 OK`          | Busca por ID             |
| `PATCH`  | `/companies/:id` | `200 OK`          | Atualiza campos parciais |
| `DELETE` | `/companies/:id` | `204 No Content`  | Remove empresa           |

**Query params disponíveis (`GET /companies`):** `name`, `taxId`, `page`, `limit`

#### Usuários — `GET /users`

| Método   | Endpoint     | Status de Sucesso | Descrição                |
| -------- | ------------ | ----------------- | ------------------------ |
| `POST`   | `/users`     | `201 Created`     | Cria um novo usuário     |
| `GET`    | `/users`     | `200 OK`          | Lista com paginação      |
| `GET`    | `/users/:id` | `200 OK`          | Busca por ID             |
| `PATCH`  | `/users/:id` | `200 OK`          | Atualiza campos parciais |
| `DELETE` | `/users/:id` | `204 No Content`  | Remove usuário           |

**Query params disponíveis (`GET /users`):** `firstname`, `email`, `role`, `page`, `limit`

#### Códigos de Erro (comum a todos os endpoints)

| Status | Significado                                             |
| ------ | ------------------------------------------------------- |
| `400`  | Dados inválidos (corpo ou parâmetros)                   |
| `404`  | Recurso não encontrado                                  |
| `409`  | Conflito de unicidade (ex: CNPJ ou email já cadastrado) |
| `422`  | Falha de validação semântica nos campos                 |
| `429`  | Rate limit excedido (100 req / 60s por IP)              |
| `500`  | Erro interno do servidor                                |

#### Schema de Resposta — Empresa

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Minha Empresa LTDA",
  "taxId": "12.345.678/0001-90",
  "stripeCustomerId": "cus_ABC123",
  "createdAt": "2026-04-12T00:00:00.000Z",
  "updatedAt": "2026-04-12T00:00:00.000Z"
}
```

#### Schema de Resposta — Usuário

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "keycloakId": "kc-uuid-1234",
  "email": "usuario@empresa.com",
  "firstname": "João",
  "lastname": "Silva",
  "role": "USER",
  "companyId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2026-04-12T00:00:00.000Z",
  "updatedAt": "2026-04-12T00:00:00.000Z"
}
```

#### Schema de Erro (400 / 404 / 409 / 422 / 429 / 500)

```json
{
  "statusCode": 404,
  "message": "Empresa não encontrada",
  "error": "Not Found"
}
```

#### Schema de Lista Paginada

```json
{
  "items": [...],
  "total": 42,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### 6.4 Modelo de Dados (SaaS)

```
Company (1) ──────────── (N) User
    │
    └─── (1) Subscription ──── (1) Plan
                  │
                  └─── (N) Invoice
```

| Entidade       | Responsabilidade                                                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Company`      | Tenant da plataforma. Possui `stripeCustomerId` (criado no checkout Stripe)                                                                                                            |
| `User`         | Membro de uma empresa. `keycloakId` vincula ao usuário no Keycloak                                                                                                                     |
| `Plan`         | Plano de assinatura (Trial / Basic / Professional / Enterprise). Cada plano tem `stripePriceId`                                                                                        |
| `Subscription` | Estado atual da assinatura de uma empresa. Sincronizado via webhooks do Stripe. Campos Stripe: `stripeSubscriptionId`, `currentPeriodStart/End`, `trialStart/End`, `cancelAtPeriodEnd` |
| `Invoice`      | Fatura gerada pelo Stripe a cada ciclo. Campos: `stripeInvoiceId`, `amountDue`, `amountPaid`, `status` (DRAFT / OPEN / PAID / VOID / UNCOLLECTIBLE)                                    |

**Status da Subscription:**
`TRIALING` → `ACTIVE` → `PAST_DUE` → `CANCELED` / `EXPIRED`
`INCOMPLETE` (pagamento inicial falhou) → `ACTIVE` (após pagamento)

### 6.5 Rate Limiting

Configurado globalmente via `ThrottlerModule` em `AppModule`:

- **Limite:** 100 requisições por 60 segundos por IP
- **Guard:** `ThrottlerGuard` aplicado globalmente
- **Resposta ao ultrapassar:** `429 Too Many Requests`

---

## 7. Fluxo de Autenticação (Resumo)

```
┌──────────┐     ┌───────────┐     ┌───────────┐     ┌────────┐
│  Browser  │────▶│  Next.js   │────▶│  Keycloak  │────▶│  Login  │
│  (User)   │◀────│  (crivo-fe)│◀────│  (OIDC)    │◀────│  Page   │
└──────────┘     └───────────┘     └───────────┘     └────────┘
      │                                    │
      │  JWT Token (access_token)          │
      ▼                                    │
┌──────────┐     ┌───────────┐             │
│  NestJS   │◀────│  Passport  │  Valida JWT via JWKS
│  (crivo-be)│    │  (JWT)     │◀────────────┘
└──────────┘     └───────────┘
```

1. Usuário acessa o frontend (`crivo-fe`)
2. Frontend redireciona para o Keycloak (login/registro)
3. Keycloak autentica e retorna um JWT (access_token)
4. Frontend envia requests para o backend com `Authorization: Bearer <token>`
5. Backend valida o token via JWKS do Keycloak

---

## 8. Fluxo de Pagamento (Resumo)

```
┌──────────┐     ┌───────────┐     ┌────────┐     ┌────────┐
│  User     │────▶│  Next.js   │────▶│ NestJS  │────▶│ Stripe  │
│  escolhe  │     │  pricing   │     │ create  │     │ Checkout│
│  plano    │     │  page      │     │ session │     │ Session │
└──────────┘     └───────────┘     └────────┘     └────────┘
                                                        │
                                        Webhook         │
                                   ┌────────────────────┘
                                   ▼
                              ┌────────┐
                              │ NestJS  │  Atualiza Subscription
                              │ webhook │  e cria Invoice
                              └────────┘
```

1. Usuário se registra → recebe Trial automático (1 dia)
2. Trial expira → usuário escolhe um plano na pricing page
3. Backend cria um Checkout Session no Stripe
4. Stripe redireciona para página de pagamento
5. Pagamento confirmado → Stripe envia webhook
6. Backend atualiza `Subscription.status` para `ACTIVE` e cria `Invoice`

---

## 9. Próximos Passos

### 9.1 Rodar a Migration do Prisma

O schema foi atualizado com campos de Stripe (`stripeCustomerId`, `stripePriceId`, `stripeSubscriptionId`, modelo `Invoice`, etc.). A migration ainda não foi aplicada ao banco:

```bash
cd apps/crivo-be
npm run prisma:migrate
```

Isso aplica as alterações ao banco e regenera o Prisma Client com os novos tipos.

---

### 9.2 Módulo de Autenticação (Keycloak JWT Guard)

Proteger os endpoints da API com validação de JWT emitido pelo Keycloak.

**Localização sugerida:** `src/libs/keycloak/` ou `src/internal/auth/`

**O que implementar:**

- `PassportStrategy` usando `passport-jwt` com JWKS (`KEYCLOAK_JWKS_URI`)
- `JwtAuthGuard` aplicado globalmente (com `@Public()` para rotas abertas)
- Decorator `@CurrentUser()` para extrair `sub` (keycloakId) e `realm_access.roles` do payload JWT

```typescript
// Exemplo de proteção global
app.useGlobalGuards(new JwtAuthGuard(reflector));
```

**Dependências necessárias:**

```bash
npm install passport passport-jwt jwks-rsa @nestjs/passport
npm install -D @types/passport-jwt
```

---

### 9.3 Módulo de Planos (`/plans`)

Seed e CRUD básico de planos para administração interna.

**Localização:** `src/internal/plans/`

**Endpoints sugeridos:**

| Método  | Endpoint     | Descrição                             |
| ------- | ------------ | ------------------------------------- |
| `GET`   | `/plans`     | Lista todos os planos ativos          |
| `POST`  | `/plans`     | Cria plano (admin only)               |
| `PATCH` | `/plans/:id` | Atualiza `stripePriceId`, `trialDays` |

**Seed inicial (via Prisma):**

```typescript
// prisma/seed.ts
await prisma.plan.createMany({
  data: [
    { type: 'TRIAL', name: 'Trial', priceMonthly: 0, trialDays: 14 },
    { type: 'BASIC', name: 'Basic', priceMonthly: 1990 },
    { type: 'PROFESSIONAL', name: 'Professional', priceMonthly: 4990 },
    { type: 'ENTERPRISE', name: 'Enterprise', priceMonthly: 0 },
  ],
});
```

---

### 9.4 Módulo Stripe (`/stripe`)

Integração com Stripe para checkout e sincronização de assinaturas via webhooks.

**Localização:** `src/internal/stripe/`

**Dependências necessárias:**

```bash
npm install stripe
```

**O que implementar:**

#### Checkout Session

```
POST /stripe/checkout
```

- Recebe `{ planId, companyId }`
- Cria (ou recupera) o `stripeCustomerId` na empresa
- Cria um `Stripe Checkout Session` com o `stripePriceId` do plano
- Retorna `{ url }` para redirecionar o usuário

#### Webhook Handler

```
POST /stripe/webhook
```

- Valida assinatura com `STRIPE_WEBHOOK_SECRET` (`stripe.webhooks.constructEvent`)
- **Eventos a tratar:**

| Evento Stripe                   | Ação no banco                                                    |
| ------------------------------- | ---------------------------------------------------------------- |
| `checkout.session.completed`    | Salva `stripeSubscriptionId` na `Subscription`                   |
| `customer.subscription.created` | Cria `Subscription` com status `TRIALING` ou `ACTIVE`            |
| `customer.subscription.updated` | Atualiza `status`, `currentPeriodStart/End`, `cancelAtPeriodEnd` |
| `customer.subscription.deleted` | Seta `status = CANCELED` e `canceledAt`                          |
| `invoice.paid`                  | Cria `Invoice` com `status = PAID`, salva `amountPaid`, `paidAt` |
| `invoice.payment_failed`        | Atualiza `Subscription.status = PAST_DUE`                        |
| `invoice.finalized`             | Cria `Invoice` com `status = OPEN`                               |

> ⚠️ O body do webhook deve ser recebido como **raw buffer** (não parsear como JSON antes da validação Stripe).

```typescript
// Configuração no main.ts
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));
```

---

### 9.5 Módulo de Assinaturas (`/subscriptions`)

Endpoints read-only para o frontend exibir o status de assinatura e faturas.

**Localização:** `src/internal/subscriptions/`

**Endpoints sugeridos:**

| Método | Endpoint                             | Descrição                              |
| ------ | ------------------------------------ | -------------------------------------- |
| `GET`  | `/subscriptions/me`                  | Assinatura atual da empresa do usuário |
| `GET`  | `/subscriptions/:companyId/invoices` | Lista faturas de uma empresa           |

---

### 9.6 Integração com Keycloak Admin API

Para que o backend possa criar/atualizar usuários no Keycloak automaticamente (ex: ao registrar via formulário interno):

**Localização:** `src/libs/keycloak/keycloak-admin.service.ts`

**Funcionalidades:**

- Obter `access_token` via Client Credentials (`crivo-api`)
- `POST /admin/realms/crivo/users` — criar usuário
- `PUT /admin/realms/crivo/users/:id` — atualizar usuário
- `POST /admin/realms/crivo/users/:id/role-mappings/realm` — atribuir role

---

## 10. Referências

- [Keycloak Admin Guide](https://www.keycloak.org/docs/latest/server_admin/)
- [Keycloak OpenID Connect](https://www.keycloak.org/docs/latest/securing_apps/#_oidc)
- [Stripe Subscriptions](https://docs.stripe.com/billing/subscriptions/overview)
- [Stripe Webhooks](https://docs.stripe.com/webhooks)
- [Stripe CLI](https://docs.stripe.com/stripe-cli)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
