# Roadmap — Próximos Passos do SaaS

Este documento descreve as funcionalidades que precisam ser implementadas para completar o fluxo comercial da plataforma Crivo. As fases estão ordenadas por dependência técnica e impacto no negócio.

---

## Fase 1 — Planos (Pré-requisito para Stripe) ✅

**Localização:** `src/internal/plans/`  
**Status:** Implementado — ver [07-PLANS.md](07-PLANS.md)

Expõe os planos cadastrados no banco (populados pelo seed) para o frontend montar a pricing page.

### Endpoints

| Método  | Endpoint     | Auth    | Descrição                                |
| ------- | ------------ | ------- | ---------------------------------------- |
| `GET`   | `/plans`     | Público | Lista planos ativos com preços e limites |
| `GET`   | `/plans/:id` | Público | Detalhe de um plano                      |
| `POST`  | `/plans`     | Admin   | Cria plano (uso interno)                 |
| `PATCH` | `/plans/:id` | Admin   | Atualiza `stripePriceId`, `trialDays`    |

### Modelo

```typescript
// PlanEntity — get/set
get id(): string
get type(): PlanType
get priceMonthly(): number   // em centavos
get trialDays(): number
get maxUsers(): number       // -1 = ilimitado
get stripePriceId(): string | null
set stripePriceId(value: string | null)
```

---

## Fase 2 — Stripe Checkout + Webhook ✅

**Localização:** `src/internal/stripe/`  
**Status:** Implementado e testado

### Implementado

- `POST /onboarding/setup-company` — cria Customer + Company + Subscription (INCOMPLETE) + Checkout Session
- `POST /stripe/checkout` — upgrade de plano (requer TenantInterceptor)
- `POST /stripe/webhook` — processa 5 tipos de evento Stripe
- `StripeService.resolvePriceId()` — aceita tanto `price_*` quanto `prod_*` (auto-resolve via Stripe API)
- Webhook handler compatível com Stripe API `2026-03-25.dahlia` (period dates em subscription items)
- Seed aceita `STRIPE_PRICE_*` com `price_` ou `prod_` prefix

### 2.1 Checkout Session

```
POST /stripe/checkout
Authorization: Bearer <token>

Body: { "planId": "uuid-do-plano" }

Response: { "url": "https://checkout.stripe.com/..." }
```

Fluxo interno:

1. Lê `companyId` via `@Tenant()`
2. Busca ou cria `stripeCustomerId` na Company
3. Cria `Stripe.Checkout.Session` com `stripePriceId` do plano
4. Retorna a `url` de redirect

### 2.2 Webhook Handler

```
POST /stripe/webhook
x-stripe-signature: <assinatura>

@Public() @SkipThrottler()
```

| Evento Stripe                   | Ação no banco                                                    |
| ------------------------------- | ---------------------------------------------------------------- |
| `checkout.session.completed`    | Salva `stripeSubscriptionId` na Subscription                     |
| `customer.subscription.created` | Cria Subscription (`TRIALING` ou `ACTIVE`)                       |
| `customer.subscription.updated` | Atualiza `status`, `currentPeriodStart/End`, `cancelAtPeriodEnd` |
| `customer.subscription.deleted` | `status = CANCELED`, seta `canceledAt`                           |
| `invoice.paid`                  | Cria Invoice `PAID` com `amountPaid` e `paidAt`                  |
| `invoice.payment_failed`        | `Subscription.status = PAST_DUE`                                 |
| `invoice.finalized`             | Cria Invoice `OPEN`                                              |

> **Importante:** validar assinatura com `stripe.webhooks.constructEvent()` antes de processar.

### Instalação

```bash
npm install stripe
```

---

## Fase 3 — Assinaturas Read-Only

**Localização:** `src/internal/subscriptions/`  
**Dependência:** Fase 2 (dados preenchidos pelos webhooks)

| Método | Endpoint                  | Descrição                          |
| ------ | ------------------------- | ---------------------------------- |
| `GET`  | `/subscriptions/me`       | Assinatura ativa + plano do tenant |
| `GET`  | `/subscriptions/invoices` | Faturas do tenant (paginado)       |

```typescript
// Resposta GET /subscriptions/me
{
  "status": "ACTIVE",
  "planType": "PROFESSIONAL",
  "currentPeriodEnd": "2026-05-13T00:00:00.000Z",
  "cancelAtPeriodEnd": false,
  "plan": {
    "type": "PROFESSIONAL",
    "priceMonthly": 4990,
    "maxUsers": 3
  }
}
```

---

## Fase 4 — Keycloak Admin Service

**Localização:** `src/libs/keycloak/keycloak-admin.service.ts`

Permite ao backend criar e gerenciar usuários no Keycloak programaticamente (sem depender de cadastro manual).

### Operações necessárias

| Método | Endpoint Keycloak Admin API                         | Uso                         |
| ------ | --------------------------------------------------- | --------------------------- |
| POST   | `/admin/realms/crivo/users`                         | Criar usuário no onboarding |
| PUT    | `/admin/realms/crivo/users/:id`                     | Atualizar email / nome      |
| POST   | `/admin/realms/crivo/users/:id/role-mappings/realm` | Atribuir role (owner, user) |
| PUT    | `/admin/realms/crivo/users/:id/reset-password`      | Forçar troca de senha       |

### Autenticação (Client Credentials)

```typescript
// Troca client_id + client_secret por access_token
POST /realms/crivo/protocol/openid-connect/token
grant_type=client_credentials
client_id=crivo-api
client_secret=<KEYCLOAK_CLIENT_SECRET>
```

### Env vars necessárias

Já configuradas no `.env`: `KEYCLOAK_BASE_URL`, `KEYCLOAK_REALM`, `KEYCLOAK_CLIENT_ID`, `KEYCLOAK_CLIENT_SECRET`.

---

## Fase 5 — Portal do Cliente (Customer Portal)

Permite ao usuário gerenciar a assinatura pelo Stripe diretamente, sem passar pelo backend.

```
POST /stripe/portal
Authorization: Bearer <token>

Response: { "url": "https://billing.stripe.com/..." }
```

Fluxo:

1. Lê `company.stripeCustomerId`
2. Chama `stripe.billingPortal.sessions.create({ customer, return_url })`
3. Retorna a URL

---

## Fase 6 — Módulo de Notificações (Email Transacional)

**Localização:** `src/libs/mail/`

| Trigger                | Email enviado                            |
| ---------------------- | ---------------------------------------- |
| Onboarding concluído   | Boas-vindas + instruções iniciais        |
| Trial expirando (D-3)  | Alerta + link para upgrade               |
| Pagamento bem-sucedido | Confirmação de fatura                    |
| Pagamento falhou       | Notificação + link para atualizar cartão |
| Subscription cancelada | Confirmação de cancelamento              |

Provedores: **Resend** ou **SendGrid** (via `@nestjs-modules/mailer` + Handlebars templates).

---

## Fase 7 — Dashboard Admin Interno

Endpoints internos (role `SUPPORT`) para gerenciar tenants:

| Método | Endpoint                           | Descrição                   |
| ------ | ---------------------------------- | --------------------------- |
| `GET`  | `/admin/companies`                 | Lista todos os tenants      |
| `GET`  | `/admin/companies/:id`             | Detalhe de uma empresa      |
| `POST` | `/admin/companies/:id/impersonate` | Gerar token de impersonação |
| `GET`  | `/admin/plans`                     | Gerenciar planos e preços   |

---

## Prioridade Sugerida

```
[✅] Fase 1 — Plans CRUD           (concluído)
[✅] Fase 2 — Stripe Checkout/Webhook (concluído)
[P1] Fase 3 — Subscriptions read  (0.5 dia)  ← PRÓXIMO PASSO
[P2] Fase 4 — Keycloak Admin      (1-2 dias)
[P3] Fase 5 — Customer Portal     (0.5 dia)
[P3] Fase 6 — Email               (1-2 dias)
[P4] Fase 7 — Admin Dashboard     (2-3 dias)
```

---

## Estado Atual (Implementado)

| Módulo                    | Status | Notas                                                 |
| ------------------------- | ------ | ----------------------------------------------------- |
| Infraestrutura            | ✅     | PostgreSQL + Keycloak + Docker                        |
| Onboarding                | ✅     | Transação atômica + 55 contas contábeis               |
| JWT Guard (Keycloak)      | ✅     | JWKS RS256, @Public() decorator                       |
| Multi-tenancy             | ✅     | Shared schema, isolamento comprovado                  |
| CRUD Companies            | ✅     | Tenant-isolated, ownership checks                     |
| CRUD Users                | ✅     | Tenant-isolated, ownership checks                     |
| RolesGuard                | ✅     | `@Roles()` — OWNER/ADMIN/SUPPORT em escritas          |
| PlanLimitGuard maxUsers   | ✅     | Bloqueia criação de usuários acima do limite do plano |
| PlanLimitGuard maxCompany | ✅     | Bloqueia criação de sub-empresas acima do limite      |
| Hierarquia de empresas    | ✅     | `parentCompanyId` — migração aplicada                 |
| Seed (4 planos)           | ✅     | `npm run prisma:seed`                                 |
| Auth dev-token            | ✅     | `POST /auth/dev-token` (dev only)                     |
| Stripe Checkout           | ✅     | Onboarding + upgrade de plano                         |
| Stripe Webhooks           | ✅     | 5 event types, compatível com API dahlia              |
| Onboarding completo       | ✅     | Transação atômica + Stripe Customer + Checkout        |
| Plans CRUD                | ✅     | `GET /plans` (público) + `POST/PATCH` (admin)         |
| Subscriptions API         | ⏳     | Fase 3 — **PRÓXIMO PASSO**                            |
| Keycloak Admin            | ⏳     | Fase 4                                                |
