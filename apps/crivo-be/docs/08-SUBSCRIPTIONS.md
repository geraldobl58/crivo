# Subscriptions API — Módulo de Assinaturas (Read-Only)

Documentação do módulo de assinaturas (`src/internal/subscriptions/`). Expõe leitura da assinatura do tenant e seu histórico de faturas. Totalmente scoped ao tenant autenticado via `TenantInterceptor`.

---

## Visão geral

Cada empresa (tenant) possui no máximo uma assinatura ativa, vinculada a um plano. As faturas são geradas pelo Stripe e sincronizadas via webhooks. Este módulo expõe endpoints read-only para o dashboard do cliente.

```
Dashboard (Autenticado + Tenant)
  │
  ├── GET /subscriptions/me        ← Assinatura ativa com detalhes do plano
  └── GET /subscriptions/invoices  ← Faturas paginadas (mais recentes primeiro)
```

---

## Arquitetura

Segue o padrão Clean Architecture + DDD do projeto:

```
src/internal/subscriptions/
├── domain/
│   ├── entities/
│   │   ├── subscription.entity.ts   # Entidade com plan info embutido
│   │   └── invoice.entity.ts        # Entidade de fatura
│   └── repository/
│       └── subscription.repository.ts # Interface + DI token + types
├── application/
│   └── use-cases/
│       ├── get-my-subscription.use-case.ts  # Busca assinatura por companyId
│       └── get-invoices.use-case.ts         # Lista faturas paginadas
├── infrastructure/
│   ├── http/
│   │   ├── subscription.controller.ts       # Endpoints REST
│   │   └── dtos/
│   │       ├── subscription-response.dto.ts
│   │       ├── invoice-response.dto.ts
│   │       └── get-invoices.query.dto.ts
│   └── prisma/
│       └── prisma-subscription.repository.ts # Implementação Prisma
└── subscription.module.ts                    # NestJS module
```

---

## Endpoints

### `GET /subscriptions/me` — Assinatura ativa do tenant

Retorna a assinatura da empresa logada com os detalhes do plano vinculado.

**Headers:** `Authorization: Bearer <token>`

**Resposta 200:**

```json
{
  "id": "uuid",
  "companyId": "uuid",
  "planId": "uuid",
  "stripeSubscriptionId": "sub_xxx",
  "status": "ACTIVE",
  "currentPeriodStart": "2025-06-01T00:00:00.000Z",
  "currentPeriodEnd": "2025-07-01T00:00:00.000Z",
  "trialStart": null,
  "trialEnd": null,
  "cancelAtPeriodEnd": false,
  "canceledAt": null,
  "plan": {
    "type": "PROFESSIONAL",
    "name": "Professional",
    "priceMonthly": 39900,
    "maxUsers": 3,
    "maxCompany": 3,
    "maxTransactions": 10000,
    "maxContacts": 5000
  },
  "createdAt": "2025-06-01T00:00:00.000Z",
  "updatedAt": "2025-06-01T00:00:00.000Z"
}
```

**Resposta 404:** empresa sem assinatura.

---

### `GET /subscriptions/invoices` — Faturas do tenant

Retorna o histórico de faturas da empresa logada, paginado por data decrescente.

**Headers:** `Authorization: Bearer <token>`

**Query params:**

| Param | Tipo   | Default | Descrição                   |
| ----- | ------ | ------- | --------------------------- |
| page  | number | 1       | Número da página            |
| limit | number | 10      | Itens por página (máx. 100) |

**Resposta 200:**

```json
{
  "items": [
    {
      "id": "uuid",
      "subscriptionId": "uuid",
      "stripeInvoiceId": "in_xxx",
      "stripePaymentIntentId": "pi_xxx",
      "status": "PAID",
      "amountDue": 39900,
      "amountPaid": 39900,
      "currency": "brl",
      "invoiceUrl": "https://invoice.stripe.com/...",
      "invoicePdf": "https://invoice.stripe.com/pdf/...",
      "periodStart": "2025-06-01T00:00:00.000Z",
      "periodEnd": "2025-07-01T00:00:00.000Z",
      "paidAt": "2025-06-01T12:00:00.000Z",
      "createdAt": "2025-06-01T00:00:00.000Z",
      "updatedAt": "2025-06-01T00:00:00.000Z"
    }
  ],
  "total": 5,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

**Resposta 404:** empresa sem assinatura.

---

## Segurança

| Endpoint                      | Auth | Tenant | Roles |
| ----------------------------- | ---- | ------ | ----- |
| `GET /subscriptions/me`       | ✅   | ✅     | —     |
| `GET /subscriptions/invoices` | ✅   | ✅     | —     |

- Autenticação via JWT (Keycloak)
- Tenant resolvido pelo `TenantInterceptor` via `@Tenant('companyId')`
- Qualquer membro da empresa pode consultar (sem restrição de role)

---

## Entidades

### SubscriptionEntity

| Campo                | Tipo    | Nullable | Descrição                           |
| -------------------- | ------- | -------- | ----------------------------------- |
| id                   | string  | ❌       | UUID                                |
| companyId            | string  | ❌       | Empresa dona                        |
| planId               | string  | ❌       | Plano vinculado                     |
| stripeSubscriptionId | string  | ✅       | ID no Stripe                        |
| status               | enum    | ❌       | TRIALING, ACTIVE, PAST_DUE, etc.    |
| currentPeriodStart   | Date    | ✅       | Início do período atual             |
| currentPeriodEnd     | Date    | ✅       | Fim do período atual                |
| trialStart           | Date    | ✅       | Início do trial                     |
| trialEnd             | Date    | ✅       | Fim do trial                        |
| cancelAtPeriodEnd    | boolean | ❌       | Cancela ao fim do período?          |
| canceledAt           | Date    | ✅       | Data do cancelamento                |
| plan                 | object  | ✅       | Info do plano (type, name, limites) |

### InvoiceEntity

| Campo                 | Tipo   | Nullable | Descrição                |
| --------------------- | ------ | -------- | ------------------------ |
| id                    | string | ❌       | UUID                     |
| subscriptionId        | string | ❌       | Assinatura vinculada     |
| stripeInvoiceId       | string | ✅       | ID no Stripe             |
| stripePaymentIntentId | string | ✅       | Payment Intent no Stripe |
| status                | enum   | ❌       | DRAFT, OPEN, PAID, etc.  |
| amountDue             | number | ❌       | Valor cobrado (centavos) |
| amountPaid            | number | ❌       | Valor pago (centavos)    |
| currency              | string | ❌       | Moeda (e.g. "brl")       |
| invoiceUrl            | string | ✅       | URL da fatura no Stripe  |
| invoicePdf            | string | ✅       | URL do PDF               |
| periodStart           | Date   | ✅       | Início do período        |
| periodEnd             | Date   | ✅       | Fim do período           |
| paidAt                | Date   | ✅       | Data do pagamento        |

---

## Notas

- Plano é incluído via `include: { plan }` no Prisma (join)
- Faturas são ordenadas por `createdAt` descrescente
- Paginação com skip/take no Prisma
- Todas as entidades possuem `toJSON()` para evitar prefixo `_` na serialização
