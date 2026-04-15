# API Reference

Base URL: `http://localhost:3333`  
Swagger UI: `http://localhost:3333/docs`

Todas as rotas exigem `Authorization: Bearer <jwt-token>` exceto as marcadas como **Público**.

---

## Autenticação

### `POST /auth/dev-token` — Público · Dev only

Obtém um JWT do Keycloak sem precisar do frontend (bloqueado em produção).

**Body:**

```json
{ "username": "user@email.com", "password": "senha" }
```

**Resposta 200:**

```json
{
  "access_token": "eyJhbGci...",
  "expires_in": 300,
  "refresh_token": "eyJhbGci...",
  "token_type": "Bearer"
}
```

---

## Onboarding

### `POST /onboarding` — Público

Registra o usuário OWNER sem empresa vinculada. A empresa é criada depois pelo dashboard (frontend).

**Body:**

```json
{
  "planType": "TRIAL",
  "keycloakId": "uuid-do-keycloak",
  "ownerEmail": "admin@empresa.com",
  "ownerFirstname": "Geraldo",
  "ownerLastname": "Luiz"
}
```

**Resposta 201:** usuário OWNER criado com plano pendente.

**Erros comuns:**

| Status | Motivo                          |
| ------ | ------------------------------- |
| 404    | `planType` não encontrado       |
| 409    | `keycloakId` ou email já existe |

---

## Empresas — `/companies`

| Método   | Endpoint         | Status           | Roles permitidas      | Descrição                                  |
| -------- | ---------------- | ---------------- | --------------------- | ------------------------------------------ |
| `POST`   | `/companies`     | `201 Created`    | ADMIN, OWNER, SUPPORT | Cria empresa (RolesGuard + PlanLimitGuard) |
| `GET`    | `/companies`     | `200 OK`         | Todos autenticados    | Lista (tenant-scoped)                      |
| `GET`    | `/companies/:id` | `200 OK`         | Todos autenticados    | Busca por ID                               |
| `PATCH`  | `/companies/:id` | `200 OK`         | ADMIN, OWNER, SUPPORT | Atualiza campos parciais                   |
| `DELETE` | `/companies/:id` | `204 No Content` | ADMIN, OWNER, SUPPORT | Remove empresa                             |

**Query params:** `name`, `page`, `limit`

**Isolamento:** `GET /companies` retorna **apenas a empresa do token autenticado**. Acesso cruzado retorna `403`.

---

## Usuários — `/users`

| Método   | Endpoint     | Status           | Roles permitidas      | Descrição                                  |
| -------- | ------------ | ---------------- | --------------------- | ------------------------------------------ |
| `POST`   | `/users`     | `201 Created`    | ADMIN, OWNER, SUPPORT | Cria usuário (RolesGuard + PlanLimitGuard) |
| `GET`    | `/users`     | `200 OK`         | Todos autenticados    | Lista usuários da empresa                  |
| `GET`    | `/users/:id` | `200 OK`         | Todos autenticados    | Busca por ID (ownership check)             |
| `PATCH`  | `/users/:id` | `200 OK`         | Todos autenticados    | Atualiza (ownership check)                 |
| `DELETE` | `/users/:id` | `204 No Content` | Todos autenticados    | Remove (ownership check)                   |

**Query params:** `firstname`, `email`, `role`, `page`, `limit`

> O `companyId` é injetado pelo `@Tenant()` decorator — não enviar no body.

> `POST /users` requer role `ADMIN`, `OWNER` ou `SUPPORT`. Usuários com role `USER` recebem `403 Forbidden`.

**Body `POST /users`:**

```json
{
  "keycloakId": "uuid-do-keycloak",
  "email": "colaborador@empresa.com",
  "firstname": "João",
  "lastname": "Silva",
  "role": "USER"
}
```

---

## Códigos de Erro

| Status | Significado                                         |
| ------ | --------------------------------------------------- |
| `400`  | Dados inválidos (corpo ou parâmetros)               |
| `401`  | Token ausente ou inválido                           |
| `403`  | Limite do plano atingido ou recurso de outro tenant |
| `404`  | Recurso não encontrado                              |
| `409`  | Conflito de unicidade (CNPJ, email, keycloakId)     |
| `422`  | Falha de validação semântica                        |
| `429`  | Rate limit excedido (100 req / 60s por IP)          |
| `500`  | Erro interno do servidor                            |

---

## Stripe — `/stripe`

### `POST /stripe/checkout` — Autenticado

Cria uma sessão de Checkout do Stripe para upgrade/downgrade de plano.

**Body:**

```json
{ "planType": "PROFESSIONAL" }
```

**Resposta 201:**

```json
{ "url": "https://checkout.stripe.com/pay/cs_test_..." }
```

Frontend redireciona o usuário para essa URL. Após o pagamento, Stripe dispara o webhook.

---

### `POST /stripe/webhook` — Público (Stripe only)

Recebe eventos do Stripe. **Não chamar manualmente.** Verifica a assinatura com `STRIPE_WEBHOOK_SECRET`.

Eventos tratados:

| Evento                          | Ação                                    |
| ------------------------------- | --------------------------------------- |
| `checkout.session.completed`    | Atualiza plano e ativa a assinatura     |
| `customer.subscription.updated` | Sincroniza status e datas da assinatura |
| `customer.subscription.deleted` | Marca assinatura como `CANCELED`        |
| `invoice.payment_succeeded`     | Registra invoice como paga              |
| `invoice.payment_failed`        | Marca assinatura como `PAST_DUE`        |

---

## Códigos de Erro

| Status | Significado                                         |
| ------ | --------------------------------------------------- |
| `400`  | Dados inválidos (corpo ou parâmetros)               |
| `401`  | Token ausente ou inválido                           |
| `403`  | Limite do plano atingido ou recurso de outro tenant |
| `404`  | Recurso não encontrado                              |
| `409`  | Conflito de unicidade (CNPJ, email, keycloakId)     |
| `422`  | Falha de validação semântica                        |
| `429`  | Rate limit excedido (100 req / 60s por IP)          |
| `500`  | Erro interno do servidor                            |

---

## Testando com Swagger

1. `POST /auth/dev-token` → copie o `access_token`
2. Clique em **Authorize** → cole o token
3. Todos os endpoints passam a usar o tenant do token automaticamente
