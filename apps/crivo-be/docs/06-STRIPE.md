# Configuração do Stripe

Guia completo para configurar o Stripe no ambiente local e em produção.

---

## Visão geral

O Crivo usa o Stripe para gerenciar assinaturas recorrentes. O fluxo completo é:

```
Login Keycloak  →  JWT validado  →  JIT Provisioning cria User no DB
        │
        ▼
POST /onboarding/setup-company   (requer auth)
  │  cria Stripe Customer
  │  cria Company no DB
  │  cria Subscription (INCOMPLETE)
  │  vincula User como OWNER
  └→ retorna checkoutUrl
        │
        ▼
Usuário paga no Stripe Checkout
        │
        ▼
Stripe dispara webhook  →  POST /stripe/webhook
  │  checkout.session.completed → Subscription = ACTIVE
  │  invoice.paid → gera Invoice no banco
  │  customer.subscription.deleted → CANCELED
        │
        ▼
TenantInterceptor (AsyncLocalStorage) + PlanLimitGuard
  controlam acesso multi-tenant e limites do plano
```

---

## Fluxo completo: do login ao checkout

### Arquitetura do fluxo

```
┌─────────────┐     ┌──────────────┐     ┌───────────────────────┐
│  Keycloak   │────▶│  JwtStrategy │────▶│  JIT User Provisioning│
│  (OAuth2)   │ JWT │  (validate)  │     │  cria User no Prisma  │
└─────────────┘     └──────────────┘     └───────────────────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ POST /onboarding/    │
                │   setup-company      │
                │  (autenticado)       │
                └──────┬───────────────┘
                       │
            ┌──────────┼──────────────────────────┐
            ▼          ▼                          ▼
     Stripe API   Prisma Transaction        Stripe Checkout
     (Customer)   (Company+Sub+User)        (Session URL)
            │          │                          │
            └──────────┼──────────────────────────┘
                       │
                       ▼
                ┌──────────────────────┐
                │  Stripe Webhook      │
                │  POST /stripe/webhook│
                │  (público, raw body) │
                └──────┬───────────────┘
                       │
         ┌─────────────┼─────────────────┐
         ▼             ▼                 ▼
   checkout.       invoice.        subscription.
   completed       paid            deleted
   (ACTIVE)        (Invoice)       (CANCELED)
```

---

### Passo 1 — Login no Keycloak (obter token)

**Em desenvolvimento**, use o endpoint auxiliar:

```http
POST /auth/dev-token
Content-Type: application/json

{
  "username": "janedoe@email.com",
  "password": "sua-senha"
}
```

Resposta:

```json
{
  "access_token": "eyJhbGci...",
  "expires_in": 300,
  "refresh_token": "...",
  "token_type": "Bearer"
}
```

> **JIT Provisioning**: Na primeira requisição autenticada, o `JwtStrategy.validate()` verifica se o usuário existe no Prisma. Se não existir, cria automaticamente usando as claims do JWT (`sub`, `email`, `given_name`, `family_name`). O usuário é criado **sem empresa** — precisa completar o onboarding.

---

### Passo 2 — Configurar empresa (onboarding atômico)

Este endpoint executa tudo em uma operação atômica com rollback:

1. Cria o **Customer** no Stripe
2. Cria a **Company** no Prisma
3. Cria a **Subscription** com status `INCOMPLETE`
4. Vincula o **User** logado como `OWNER`
5. Cria a **Checkout Session** no Stripe
6. Retorna a `checkoutUrl`

> Se qualquer passo falhar (ex: Stripe fora do ar), a transação Prisma faz rollback e o Customer do Stripe é deletado.

```http
POST /onboarding/setup-company
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "planType": "BASIC",
  "companyName": "Minha Empresa LTDA"
}
```

| Campo         | Obrigatório | Descrição                                             |
| ------------- | ----------- | ----------------------------------------------------- |
| `planType`    | sim         | Plano desejado: `BASIC`, `PROFESSIONAL`, `ENTERPRISE` |
| `companyName` | sim         | Nome da empresa                                       |

Resposta (`201 Created`):

```json
{
  "company": {
    "id": "550e8400-...",
    "name": "Minha Empresa LTDA"
  },
  "subscription": {
    "id": "660e8400-...",
    "status": "INCOMPLETE"
  },
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_..."
}
```

> Redirecione o usuário para `checkoutUrl`. Após o pagamento, o webhook atualiza o status para `ACTIVE`.  
> Se chamado com um usuário que já tem empresa, retorna `409 Conflict`.

---

### Passo 3 — Pagamento e ativação via webhook

Após o pagamento no Stripe Checkout:

1. Stripe dispara `checkout.session.completed`
2. Backend busca detalhes da subscription no Stripe
3. Atualiza `Subscription.status` → `ACTIVE`, `planId` → plano pago, `stripeSubscriptionId`
4. Limpa `User.pendingPlanType` de todos os usuários da empresa

A empresa está ativa e o `PlanLimitGuard` permite operações de acordo com os limites do plano.

---

### Passo 4 (opcional) — Upgrade de plano

Empresas já ativadas podem trocar de plano via:

```http
POST /stripe/checkout
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "planType": "PROFESSIONAL"
}
```

> Requer `TenantInterceptor` — o usuário precisa ter empresa e assinatura ativa.

---

### Resumo dos erros comuns

| Erro                                        | Causa                                      | Solução                                        |
| ------------------------------------------- | ------------------------------------------ | ---------------------------------------------- |
| `User not found`                            | Token válido mas JIT provisioning falhou   | Verificar se a rota não está marcada `@Public` |
| `User is already associated with a company` | Onboarding já foi feito                    | Usar `POST /stripe/checkout` para upgrade      |
| `Plan "X" has no Stripe price configured`   | `STRIPE_PRICE_X` não configurado no `.env` | Configurar variáveis (Seção 3)                 |
| `Subscription not active (INCOMPLETE)`      | Pagamento não finalizado no Stripe         | Completar o checkout na URL retornada          |
| `No active subscription found`              | Empresa existe mas sem assinatura válida   | Chamar `POST /stripe/checkout`                 |

---

## Arquitetura técnica

### Multi-tenant com AsyncLocalStorage

O `TenantInterceptor` resolve o contexto do tenant (company, user, plan) e o armazena em dois locais:

1. **`request.tenantContext`** — acessível via `@Tenant()` decorator nos controllers
2. **`AsyncLocalStorage`** — acessível via `TenantService` em qualquer camada (services, repositories, use-cases)

```
Request → JwtAuthGuard → TenantInterceptor → AsyncLocalStorage.run()
                                                     │
                                              ┌──────┴──────┐
                                              ▼             ▼
                                         TenantService  TenantPrismaService
                                         (singleton)    (auto-filter companyId)
```

O `TenantPrismaService` usa Prisma Extensions para injetar `WHERE companyId = ?` automaticamente em todas as queries dos models multi-tenant (`User`, `Subscription`, `ChartOfAccount`).

### PlanLimitGuard

Guard que verifica limites do plano antes de operações de escrita:

- `@PlanResource('users')` — verifica `plan.maxUsers`
- `@PlanResource('company')` — verifica `plan.maxCompany`

Aceita subscriptions com status `ACTIVE` ou `TRIALING`.

### Webhook Handler

O `HandleStripeWebhookUseCase` processa 5 tipos de evento:

| Evento                          | Ação                                                    |
| ------------------------------- | ------------------------------------------------------- |
| `checkout.session.completed`    | Ativa subscription, atualiza plano, limpa pendingPlan   |
| `customer.subscription.updated` | Atualiza status/período/cancelamento                    |
| `customer.subscription.deleted` | Marca como `CANCELED`                                   |
| `invoice.payment_succeeded`     | Cria/atualiza Invoice como `PAID`                       |
| `invoice.payment_failed`        | Marca subscription como `PAST_DUE`, Invoice como `OPEN` |

---

## 1. Conta e API Keys

1. Acesse [https://dashboard.stripe.com](https://dashboard.stripe.com) e crie ou acesse sua conta.
2. No menu lateral: **Developers → API keys**
3. Copie as duas chaves do modo **Test**:

| Variável                 | Onde encontrar                      |
| ------------------------ | ----------------------------------- |
| `STRIPE_SECRET_KEY`      | **Secret key** — `sk_test_...`      |
| `STRIPE_PUBLISHABLE_KEY` | **Publishable key** — `pk_test_...` |

> Em produção use as chaves do modo **Live** (`sk_live_...` / `pk_live_...`).

---

## 2. Criar os Produtos e Preços

Cada plano do Crivo precisa de um **Product** com um **Price** recorrente no Stripe.

### 2.1 Acesse o catálogo

**Product catalog → + Add product**

### 2.2 Crie um produto para cada plano

Repita o processo para os 4 planos abaixo:

| Produto      | Nome sugerido      | Preço (BRL/mês) | Variável de ambiente        |
| ------------ | ------------------ | --------------- | --------------------------- |
| TRIAL        | Crivo Trial        | R$ 0,00         | `STRIPE_PRICE_TRIAL`        |
| BASIC        | Crivo Basic        | R$ 299,00       | `STRIPE_PRICE_BASIC`        |
| PROFESSIONAL | Crivo Professional | R$ 399,00       | `STRIPE_PRICE_PROFESSIONAL` |
| ENTERPRISE   | Crivo Enterprise   | R$999,00        | `STRIPE_PRICE_ENTERPRISE`   |

**Configuração de cada produto:**

- Pricing model: `Recurring`
- Billing period: `Monthly`
- Currency: `BRL`

### 2.3 Copie o Price ID ou Product ID

Após criar cada produto, copie o **Price ID** (`price_*`) ou o **Product ID** (`prod_*`). Ambos são aceitos no `.env`.

> O `StripeService.resolvePriceId()` auto-resolve Product IDs para o Price ID ativo via Stripe API. O seed também aceita ambos os formatos.

---

## 3. Variáveis de Ambiente

Adicione ao `.env` em `apps/crivo-be/`:

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_51...
STRIPE_PUBLISHABLE_KEY=pk_test_51...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_TRIAL=price_xxxxxxxxxxxxx      # ou prod_xxxxxxxxxxxxx
STRIPE_PRICE_BASIC=price_xxxxxxxxxxxxx      # ou prod_xxxxxxxxxxxxx
STRIPE_PRICE_PROFESSIONAL=price_xxxxxxxxxxxxx  # ou prod_xxxxxxxxxxxxx
STRIPE_PRICE_ENTERPRISE=price_xxxxxxxxxxxxx    # ou prod_xxxxxxxxxxxxx
```

> Tanto `price_*` (Price ID) quanto `prod_*` (Product ID) são aceitos. Product IDs são auto-resolvidos para o price ativo via Stripe API.

> `STRIPE_WEBHOOK_SECRET` é obtido na etapa 4.

---

## 4. Configurar o Webhook

O backend precisa receber eventos do Stripe para atualizar as assinaturas no banco.

### 4.1 Para produção

1. **Developers → Webhooks → + Add endpoint**
2. **Endpoint URL:** `https://seu-dominio.com/stripe/webhook`
3. **Events to send:** selecione os eventos abaixo individualmente ou use `Select all events`

   | Evento                          | O que aciona                         |
   | ------------------------------- | ------------------------------------ |
   | `checkout.session.completed`    | Pagamento inicial concluído          |
   | `customer.subscription.updated` | Plano alterado, renovação, pausa     |
   | `customer.subscription.deleted` | Cancelamento efetivado               |
   | `invoice.payment_succeeded`     | Pagamento de fatura bem-sucedido     |
   | `invoice.payment_failed`        | Falha no pagamento (cartão recusado) |

4. Após criar, clique no webhook → **Signing secret → Reveal** → copie para `STRIPE_WEBHOOK_SECRET`.

### 4.2 Para desenvolvimento local (Stripe CLI)

O Stripe CLI encaminha os eventos do Stripe para o seu servidor local.

**Instalação:**

```bash
# macOS
brew install stripe/stripe-cli/stripe

# Linux
wget -q https://github.com/stripe/stripe-cli/releases/latest/download/stripe_linux_amd64.tar.gz
tar -xvf stripe_linux_amd64.tar.gz
sudo mv stripe /usr/local/bin
```

**Autenticação:**

```bash
stripe login
# Abre o browser para autenticar com sua conta Stripe
```

**Iniciar o listener:**

```bash
stripe listen --forward-to localhost:3333/stripe/webhook
```

A saída mostra o `STRIPE_WEBHOOK_SECRET` local (muda a cada sessão):

```
> Ready! Your webhook signing secret is whsec_abc123... (^C to quit)
```

Copie esse valor para o `.env` enquanto o `stripe listen` estiver rodando.

**Rodar em conjunto com o backend:**

```bash
# Terminal 1
npm run start:dev

# Terminal 2
stripe listen --forward-to localhost:3333/stripe/webhook
```

---

## 5. Popular os Planos no Banco

O seed lê as variáveis `STRIPE_PRICE_*` e preenche o campo `Plan.stripePriceId` para cada plano. Rode sempre que alterar os Price IDs:

```bash
npm run prisma:seed
```

Verifique no Prisma Studio se `stripePriceId` foi preenchido:

```bash
npm run prisma:studio
# Acesse http://localhost:5555 → tabela Plan
```

---

## 6. Testar o Fluxo Completo Localmente

### 6.1 Setup inicial

Com o servidor e o `stripe listen` rodando:

```bash
# Terminal 1: Backend
npm run start:dev

# Terminal 2: Stripe listener
stripe listen --forward-to localhost:3333/stripe/webhook
```

### 6.2 Login (obter token)

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/dev-token \
  -H "Content-Type: application/json" \
  -d '{"username":"janedoe@email.com","password":"senha"}' \
  | jq -r .access_token)

echo $TOKEN
```

> O JIT Provisioning cria o usuário automaticamente na primeira requisição autenticada.

### 6.3 Onboarding (criar empresa + checkout)

```bash
curl -X POST http://localhost:8000/onboarding/setup-company \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planType":"BASIC","companyName":"Minha Empresa LTDA"}'
```

Resposta esperada:

```json
{
  "company": { "id": "...", "name": "Minha Empresa LTDA" },
  "subscription": { "id": "...", "status": "INCOMPLETE" },
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_..."
}
```

### 6.4 Simular pagamento

Abra a `checkoutUrl` retornada no browser. Use os cartões de teste do Stripe:

| Cartão                | Resultado          |
| --------------------- | ------------------ |
| `4242 4242 4242 4242` | Pagamento aprovado |
| `4000 0000 0000 9995` | Cartão recusado    |
| `4000 0025 0000 3155` | Requer 3D Secure   |

Validade: qualquer data futura · CVC: qualquer 3 dígitos · CEP: qualquer valor.

Após o pagamento, verifique no terminal do `stripe listen` que o evento `checkout.session.completed` foi recebido.

### 6.5 Verificar ativação

```bash
# Verificar no banco que a Subscription ficou ACTIVE
npm run prisma:studio
# Acesse http://localhost:5555 → tabela Subscription → status deve ser ACTIVE
```

### 6.6 Disparar eventos manualmente via CLI

```bash
# Simular checkout concluído
stripe trigger checkout.session.completed

# Simular falha de pagamento
stripe trigger invoice.payment_failed

# Simular cancelamento
stripe trigger customer.subscription.deleted
```

---

## 7. Mapeamento de Status

O backend converte os status do Stripe para o enum `SubscriptionStatus` do Prisma:

| Status Stripe        | SubscriptionStatus |
| -------------------- | ------------------ |
| `active`             | `ACTIVE`           |
| `trialing`           | `TRIALING`         |
| `past_due`           | `PAST_DUE`         |
| `canceled`           | `CANCELED`         |
| `incomplete`         | `INCOMPLETE`       |
| `incomplete_expired` | `EXPIRED`          |
| `unpaid` / `paused`  | `PAST_DUE`         |

---

## 8. Checklist de Configuração

- [x] `STRIPE_SECRET_KEY` preenchido no `.env`
- [x] `STRIPE_PUBLISHABLE_KEY` preenchido no `.env`
- [x] 4 produtos criados no Stripe com preços recorrentes em BRL
- [x] `STRIPE_PRICE_TRIAL/BASIC/PROFESSIONAL/ENTERPRISE` preenchidos com `price_...` ou `prod_...`
- [x] `npm run prisma:seed` executado — `Plan.stripePriceId` populado no banco
- [x] Webhook configurado no Stripe Dashboard (produção) **ou** `stripe listen` rodando (local)
- [x] `STRIPE_WEBHOOK_SECRET` preenchido no `.env`
- [x] `POST /onboarding/setup-company` retorna URL válida
- [x] Pagamento de teste aprovado → `Subscription.status` = `ACTIVE` no banco

---

## 9. Notas de compatibilidade

### Stripe API `2026-03-25.dahlia`

A partir da versão `2025-03-31.basil`, o Stripe moveu `current_period_start` e `current_period_end` do objeto Subscription para os **Subscription Items** (`subscription.items.data[0]`).

O webhook handler lê os period dates de `items.data[0]` com fallback para o root-level, garantindo compatibilidade com versões anteriores e futuras da API.

### Product ID vs Price ID

O `StripeService.resolvePriceId()` aceita ambos:

- `price_*` → usado diretamente
- `prod_*` → resolvido para o price ativo via `stripe.prices.list({ product, active: true })`
