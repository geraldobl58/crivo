# Plans CRUD — Módulo de Planos

Documentação do módulo de planos (`src/internal/plans/`). Expõe os planos cadastrados no banco para o frontend montar a pricing page e permite gestão administrativa.

---

## Visão geral

Os planos são populados pelo seed (`npm run prisma:seed`) com 4 tipos: `TRIAL`, `BASIC`, `PROFESSIONAL`, `ENTERPRISE`. Este módulo expõe endpoints de leitura pública (pricing page) e escrita administrativa.

```
Frontend (Pricing Page)
  │
  ├── GET /plans              ← Lista planos ativos (público)
  ├── GET /plans/:id          ← Detalhe de um plano (público)
  │
Admin (OWNER / SUPPORT)
  │
  ├── POST /plans             ← Criar plano (autenticado)
  └── PATCH /plans/:id        ← Atualizar plano (autenticado)
```

---

## Arquitetura

Segue o padrão Clean Architecture + DDD do projeto:

```
src/internal/plans/
├── domain/
│   ├── entities/
│   │   └── plan.entity.ts          # Entidade com getters/setters
│   └── repository/
│       └── plan.repository.ts       # Interface + DI token + types
├── application/
│   └── use-cases/
│       ├── get-plans.use-case.ts    # Lista paginada
│       ├── get-plan-by-id.use-case.ts # Busca por ID
│       ├── create-plan.use-case.ts  # Cria plano (verifica duplicata)
│       └── update-plan.use-case.ts  # Atualiza plano
├── infrastructure/
│   ├── http/
│   │   ├── plan.controller.ts       # Endpoints REST
│   │   └── dtos/
│   │       ├── create-plan.dto.ts
│   │       ├── update-plan.dto.ts
│   │       ├── get-plans.query.dto.ts
│   │       └── plan-response.dto.ts
│   └── prisma/
│       └── prisma-plan.repository.ts # Implementação Prisma
└── plan.module.ts                    # NestJS module
```

---

## Endpoints

### `GET /plans` — Listar planos

**Auth:** Público (`@Public()`)

```http
GET /plans?isActive=true&page=1&limit=10
```

| Query Param | Tipo    | Default | Descrição                   |
| ----------- | ------- | ------- | --------------------------- |
| `isActive`  | boolean | —       | Filtrar por planos ativos   |
| `page`      | number  | 1       | Número da página            |
| `limit`     | number  | 10      | Itens por página (máx. 100) |

**Resposta:** `200 OK`

```json
{
  "items": [
    {
      "id": "uuid",
      "type": "TRIAL",
      "name": "Crivo Trial",
      "description": null,
      "priceMonthly": 0,
      "stripePriceId": "prod_xxx",
      "trialDays": 1,
      "maxUsers": 1,
      "maxCompany": 1,
      "maxTransactions": 1,
      "maxContacts": 1,
      "isActive": true,
      "createdAt": "2026-04-15T...",
      "updatedAt": "2026-04-15T..."
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

> Planos ordenados por `priceMonthly` crescente (TRIAL → BASIC → PROFESSIONAL → ENTERPRISE).

---

### `GET /plans/:id` — Detalhe do plano

**Auth:** Público (`@Public()`)

```http
GET /plans/550e8400-e29b-41d4-a716-446655440000
```

**Resposta:** `200 OK` — retorna um `PlanResponseDto`

**Erros:**

- `404` — Plano não encontrado

---

### `POST /plans` — Criar plano

**Auth:** Requer token JWT + role `OWNER` ou `SUPPORT`

```http
POST /plans
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "BASIC",
  "name": "Crivo Basic",
  "description": "Plano básico para pequenas empresas",
  "priceMonthly": 29900,
  "stripePriceId": "prod_xxxxxxxxxxxxx",
  "trialDays": 0,
  "maxUsers": 1,
  "maxCompany": 1,
  "maxTransactions": 1,
  "maxContacts": 1
}
```

| Campo             | Obrigatório | Tipo     | Descrição                                      |
| ----------------- | ----------- | -------- | ---------------------------------------------- |
| `type`            | sim         | PlanType | `TRIAL`, `BASIC`, `PROFESSIONAL`, `ENTERPRISE` |
| `name`            | sim         | string   | Nome do plano                                  |
| `description`     | não         | string   | Descrição                                      |
| `priceMonthly`    | sim         | number   | Preço em centavos                              |
| `stripePriceId`   | não         | string   | Price ID ou Product ID do Stripe               |
| `trialDays`       | não         | number   | Dias de teste (default: 0)                     |
| `maxUsers`        | não         | number   | Limite de usuários (default: -1)               |
| `maxCompany`      | não         | number   | Limite de sub-empresas (default: -1)           |
| `maxTransactions` | não         | number   | Limite de transações (default: -1)             |
| `maxContacts`     | não         | number   | Limite de contatos (default: -1)               |

**Resposta:** `201 Created` — retorna o plano criado

**Erros:**

- `401` — Token inválido ou ausente
- `403` — Role insuficiente
- `409` — Já existe plano com esse tipo

---

### `PATCH /plans/:id` — Atualizar plano

**Auth:** Requer token JWT + role `OWNER` ou `SUPPORT`

```http
PATCH /plans/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json

{
  "stripePriceId": "price_xxxxxxxxxxxxx",
  "trialDays": 7,
  "isActive": false
}
```

Todos os campos são opcionais. Campos não enviados permanecem inalterados.

**Resposta:** `200 OK` — retorna o plano atualizado

**Erros:**

- `401` — Token inválido ou ausente
- `403` — Role insuficiente
- `404` — Plano não encontrado

---

## Modelo Prisma

```prisma
model Plan {
  id          String   @id @default(uuid())
  type        PlanType @unique
  name        String
  description String?

  priceMonthly Int          // Em centavos (ex: 29900 = R$299,00)
  stripePriceId String? @unique  // Price ID ou Product ID do Stripe

  trialDays       Int @default(0)
  maxUsers        Int @default(-1)   // -1 = ilimitado
  maxCompany      Int @default(-1)
  maxTransactions Int @default(-1)
  maxContacts     Int @default(-1)

  isActive Boolean @default(true)

  subscriptions Subscription[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## Planos padrão (seed)

| Tipo         | Nome               | Preço/mês | Trial | maxUsers | maxCompany |
| ------------ | ------------------ | --------- | ----- | -------- | ---------- |
| TRIAL        | Crivo Trial        | R$ 0,00   | 1 dia | 1        | 1          |
| BASIC        | Crivo Basic        | R$ 19,90  | 0     | 1        | 1          |
| PROFESSIONAL | Crivo Professional | R$ 49,90  | 0     | 3        | 3          |
| ENTERPRISE   | Crivo Enterprise   | R$ 99,90  | 0     | -1       | -1         |

> Populados via `npm run prisma:seed`. O seed aceita tanto `price_*` quanto `prod_*` nas variáveis `STRIPE_PRICE_*`.

---

## Testar localmente

### Listar planos (público)

```bash
curl http://localhost:8000/plans
```

### Buscar plano por ID

```bash
curl http://localhost:8000/plans/<uuid>
```

### Criar plano (requer auth)

```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/dev-token \
  -H "Content-Type: application/json" \
  -d '{"username":"janedoe@email.com","password":"senha"}' \
  | jq -r .access_token)

curl -X POST http://localhost:8000/plans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "BASIC",
    "name": "Crivo Basic",
    "priceMonthly": 29900,
    "maxUsers": 1,
    "maxCompany": 1
  }'
```

### Atualizar plano (requer auth)

```bash
curl -X PATCH http://localhost:8000/plans/<uuid> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"stripePriceId": "price_xxxxxxxxxxxxx", "trialDays": 7}'
```

---

## Decisões de design

1. **GET público**: `GET /plans` e `GET /plans/:id` são `@Public()` — sem autenticação — para o frontend montar a pricing page sem login.
2. **POST/PATCH restrito**: Somente `OWNER` e `SUPPORT` podem criar/atualizar planos. Usado internamente para ajustar limites e vincular Stripe Price IDs.
3. **Sem DELETE**: Planos não são deletados. Use `PATCH` para setar `isActive: false`.
4. **Unicidade por tipo**: Não é possível criar dois planos com o mesmo `PlanType`. O seed já popula os 4 tipos.
5. **Sem TenantInterceptor**: Planos são globais (compartilhados entre todos os tenants).
