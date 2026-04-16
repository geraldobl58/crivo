# Admin Dashboard — Endpoints Internos

Documentação do módulo `AdminModule` (`src/internal/admin/`). Endpoints cross-tenant para suporte interno da plataforma.

---

## Visão geral

O dashboard admin permite que usuários com role `SUPPORT` tenham visibilidade e controle total sobre todos os tenants da plataforma, **sem restrição de tenant** (não usa `TenantInterceptor`).

---

## Autenticação & Autorização

- **Auth:** JWT Bearer (Keycloak) — mesma autenticação de qualquer endpoint
- **Role:** `SUPPORT` obrigatório — verificado via `RolesGuard` no nível do controller
- **Tenant:** NÃO usa `TenantInterceptor` — acesso cross-tenant

---

## Endpoints

### `GET /admin/metrics`

Métricas gerais da plataforma.

**Response** `200 OK`:

```json
{
  "overview": {
    "totalCompanies": 150,
    "totalUsers": 480,
    "totalRevenue": 1250000
  },
  "subscriptionsByStatus": [
    { "status": "ACTIVE", "count": 95 },
    { "status": "TRIALING", "count": 30 },
    { "status": "CANCELED", "count": 25 }
  ],
  "subscriptionsByPlan": [
    { "planType": "PROFESSIONAL", "planName": "Professional", "count": 60 },
    { "planType": "BASIC", "planName": "Basic", "count": 50 },
    { "planType": "ENTERPRISE", "planName": "Enterprise", "count": 10 }
  ],
  "recentCompanies": [
    {
      "id": "uuid",
      "name": "Nova Empresa",
      "createdAt": "2026-04-16T00:00:00.000Z",
      "planType": "PROFESSIONAL",
      "status": "ACTIVE"
    }
  ]
}
```

| Campo             | Descrição                                                 |
| ----------------- | --------------------------------------------------------- |
| `totalRevenue`    | Soma de `amountPaid` de todas as invoices PAID (centavos) |
| `recentCompanies` | Últimas 5 empresas criadas                                |

---

### `GET /admin/companies`

Lista paginada de todas as empresas da plataforma.

**Query params:**

| Param      | Tipo   | Descrição                         | Default |
| ---------- | ------ | --------------------------------- | ------- |
| `name`     | string | Filtro por nome (ilike)           | —       |
| `status`   | enum   | Filtro por status da subscription | —       |
| `planType` | enum   | Filtro por tipo de plano          | —       |
| `page`     | number | Página (1-based)                  | 1       |
| `limit`    | number | Itens por página (1-100)          | 20      |

**Response** `200 OK`:

```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Empresa XPTO",
      "taxId": "12.345.678/0001-90",
      "stripeCustomerId": "cus_ABC123",
      "parentCompanyId": null,
      "usersCount": 5,
      "childCompaniesCount": 2,
      "subscription": {
        "id": "uuid",
        "status": "ACTIVE",
        "planType": "PROFESSIONAL",
        "planName": "Professional",
        "currentPeriodEnd": "2026-05-14T00:00:00.000Z",
        "cancelAtPeriodEnd": false
      },
      "createdAt": "2026-04-12T00:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20,
  "totalPages": 8
}
```

---

### `GET /admin/companies/:id`

Detalhe completo de uma empresa.

**Response** `200 OK`:

```json
{
  "id": "uuid",
  "name": "Empresa XPTO",
  "taxId": "12.345.678/0001-90",
  "stripeCustomerId": "cus_ABC123",
  "parentCompanyId": null,
  "createdAt": "2026-04-12T00:00:00.000Z",
  "updatedAt": "2026-04-14T00:00:00.000Z",
  "users": [
    {
      "id": "uuid",
      "email": "owner@empresa.com",
      "firstname": "João",
      "lastname": "Silva",
      "role": "OWNER",
      "keycloakId": "keycloak-uuid",
      "createdAt": "2026-04-12T00:00:00.000Z"
    }
  ],
  "childCompanies": [
    {
      "id": "uuid",
      "name": "Filial SP",
      "taxId": null,
      "createdAt": "2026-04-14T00:00:00.000Z"
    }
  ],
  "subscription": {
    "id": "uuid",
    "status": "ACTIVE",
    "stripeSubscriptionId": "sub_ABC123",
    "currentPeriodStart": "2026-04-14T00:00:00.000Z",
    "currentPeriodEnd": "2026-05-14T00:00:00.000Z",
    "trialStart": null,
    "trialEnd": null,
    "cancelAtPeriodEnd": false,
    "canceledAt": null,
    "createdAt": "2026-04-12T00:00:00.000Z",
    "plan": {
      "id": "uuid",
      "type": "PROFESSIONAL",
      "name": "Professional",
      "priceMonthly": 4990,
      "maxUsers": 3,
      "maxCompany": 3
    },
    "invoices": [
      {
        "id": "uuid",
        "stripeInvoiceId": "in_ABC123",
        "status": "PAID",
        "amountDue": 4990,
        "amountPaid": 4990,
        "currency": "brl",
        "invoiceUrl": "https://...",
        "paidAt": "2026-04-14T00:00:00.000Z",
        "createdAt": "2026-04-14T00:00:00.000Z"
      }
    ]
  }
}
```

---

### `POST /admin/companies/:id/impersonate`

Gera um JWT access token para o **OWNER** da empresa via Keycloak Token Exchange.

> **⚠️ CUIDADO:** Todas as impersonações são logadas com nível `WARN`. Use apenas quando absolutamente necessário para debug de suporte.

**Pré-requisito Keycloak:** O client deve ter permissão de `token-exchange` habilitada no realm.

**Response** `200 OK`:

```json
{
  "accessToken": "eyJhbGciOiJSUzI1NiIs...",
  "expiresIn": 300,
  "impersonatedUser": {
    "id": "uuid",
    "email": "owner@empresa.com",
    "keycloakId": "keycloak-uuid"
  },
  "company": {
    "id": "uuid",
    "name": "Empresa XPTO"
  }
}
```

**Uso no frontend:**

```typescript
// Após obter o token de impersonação
const res = await fetch('/admin/companies/uuid/impersonate', {
  method: 'POST',
  headers: { Authorization: `Bearer ${adminToken}` },
});
const { accessToken } = await res.json();

// Fazer requests como o owner da empresa
const data = await fetch('/subscriptions/me', {
  headers: { Authorization: `Bearer ${accessToken}` },
});
```

---

## Arquitetura

```
src/internal/admin/
├── admin.module.ts
├── application/
│   └── use-cases/
│       ├── list-companies.use-case.ts
│       ├── get-company-detail.use-case.ts
│       ├── get-platform-metrics.use-case.ts
│       └── impersonate-user.use-case.ts
└── infrastructure/
    └── http/
        ├── admin.controller.ts
        └── dtos/
            ├── list-companies.query.dto.ts
            └── admin-response.dto.ts
```

### Design decisions

1. **Sem DDD completo** — O admin é um módulo read-heavy. Use cases consultam `PrismaService` diretamente sem camada de domain entities/repository.

2. **Sem TenantInterceptor** — O propósito é acesso cross-tenant. O `RolesGuard` com `@Roles('SUPPORT')` é a proteção principal.

3. **Métricas via aggregations** — Usa `groupBy`, `count` e `aggregate` do Prisma para cálculos em tempo real. Para alta escala, considerar materializar em tabela separada.

4. **Impersonação via Token Exchange** — Usa o mecanismo padrão do OAuth2 Token Exchange (RFC 8693). Requer configuração no Keycloak — ver seção abaixo.

---

## Configuração Keycloak — Token Exchange

Para o endpoint de impersonação funcionar, ative Token Exchange no realm:

1. **Admin Console** → Realm Settings → Token Policies
2. Verifique que o feature `token-exchange` está habilitado
3. No client `crivo-api`:
   - Aba **Permissions** → habilite
   - Adicione policy que permita `token-exchange` para o service account

Caso o Token Exchange não esteja disponível, o endpoint retornará `503 Service Unavailable` com mensagem indicativa.

---

## Notas técnicas

- **Rate limit:** 100 req/min (global) — aplicado a admins também
- **Swagger:** Documentado em `/docs` sob tag "Admin"
- **Logs:** Impersonação logada como `WARN` — incluir auditoria em produção
- **Invoices:** O detalhe da empresa mostra as 10 faturas mais recentes
