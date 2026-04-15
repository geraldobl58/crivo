# Guia de Testes Manuais

Fluxo passo a passo para validar os guards, limites de plano e hierarquia de empresas via Swagger ou curl.

**Pré-requisito:** infraestrutura rodando (`docker compose up -d`) e servidor no ar (`npm run start:dev`).

---

## 1. Obter tokens de acesso

### 1.1 Token do OWNER (usuário que criou a empresa)

Use o usuário criado no onboarding (ver Etapa 2 abaixo ou use um existente):

```bash
curl -s -X POST http://localhost:3333/auth/dev-token \
  -H "Content-Type: application/json" \
  -d '{ "username": "owner@empresa.com", "password": "senha123" }' \
  | jq .access_token
```

> Guarde o token em `$OWNER_TOKEN` para os próximos passos.

### 1.2 Token de um USER comum

Crie um usuário com `role: USER` via `POST /users` (usando o token OWNER) e depois obtenha o token dele:

```bash
curl -s -X POST http://localhost:3333/auth/dev-token \
  -H "Content-Type: application/json" \
  -d '{ "username": "funcionario@empresa.com", "password": "senha123" }' \
  | jq .access_token
```

> Guarde em `$USER_TOKEN`.

---

## 2. Onboarding — criar empresa de teste

```bash
curl -s -X POST http://localhost:3333/onboarding \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Contabilidade Teste LTDA",
    "taxId": "12.345.678/0001-99",
    "planType": "TRIAL",
    "keycloakId": "<sub do JWT do owner>",
    "ownerEmail": "owner@empresa.com",
    "ownerFirstname": "Fulano",
    "ownerLastname": "Teste"
  }'
```

**Resultado esperado:** `201 Created` — retorna `company`, `subscription`, `user`, `chartOfAccountsCount: 55`.

---

## 3. Testar RolesGuard em `/users`

### 3.1 OWNER cria usuário → deve funcionar

```bash
curl -s -X POST http://localhost:3333/users \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "funcionario@empresa.com",
    "password": "senha123",
    "firstname": "Funcionario",
    "lastname": "Teste",
    "role": "USER"
  }'
```

**Esperado:** `201 Created`

### 3.2 USER comum tenta criar usuário → deve ser bloqueado

```bash
curl -s -X POST http://localhost:3333/users \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "email": "novo@empresa.com", "password": "x", "firstname": "X", "lastname": "Y", "role": "USER" }'
```

**Esperado:** `403 Forbidden`

```json
{
  "message": "Access denied. Required roles: ADMIN, OWNER, SUPPORT. Your role: USER."
}
```

---

## 4. Testar PlanLimitGuard — limite de usuários (maxUsers)

O plano **TRIAL** permite **1 usuário**. Se o onboarding já criou o OWNER (1 usuário), a próxima tentativa deve falhar.

```bash
# Segunda tentativa de criar usuário (OWNER token, plano TRIAL)
curl -s -X POST http://localhost:3333/users \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "extra@empresa.com",
    "password": "senha123",
    "firstname": "Extra",
    "lastname": "User",
    "role": "USER"
  }'
```

**Esperado:** `403 Forbidden`

```json
{
  "message": "User limit reached for your \"Trial\" plan. Current: 1/1 users. Please upgrade your plan to add more users."
}
```

> Para testar com mais usuários, use `planType: "PROFESSIONAL"` (maxUsers: 3) no onboarding.

---

## 5. Testar RolesGuard em `/companies`

### 5.1 USER comum tenta criar sub-empresa → deve ser bloqueado

```bash
curl -s -X POST http://localhost:3333/companies \
  -H "Authorization: Bearer $USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Filial Teste", "taxId": "98.765.432/0001-00" }'
```

**Esperado:** `403 Forbidden`

### 5.2 OWNER cria sub-empresa → deve funcionar

```bash
curl -s -X POST http://localhost:3333/companies \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Filial Teste LTDA", "taxId": "98.765.432/0001-00" }'
```

**Esperado:** `201 Created` — o campo `parentCompanyId` deve conter o ID da empresa principal.

---

## 6. Testar PlanLimitGuard — limite de empresas (maxCompany)

O plano **TRIAL** permite **1 sub-empresa**. Crie a primeira e tente a segunda:

```bash
# Primeira sub-empresa (deve funcionar)
curl -s -X POST http://localhost:3333/companies \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Filial 1 LTDA", "taxId": "11.111.111/0001-11" }'

# Segunda sub-empresa (deve ser bloqueada no TRIAL)
curl -s -X POST http://localhost:3333/companies \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "name": "Filial 2 LTDA", "taxId": "22.222.222/0001-22" }'
```

**Esperado na segunda:** `403 Forbidden`

```json
{
  "message": "Company limit reached for your \"Trial\" plan. Current: 1/1 companies. Please upgrade your plan to add more companies."
}
```

---

## 7. Testar isolamento de tenant

Onboarde **duas empresas distintas** e verifique que cada OWNER vê apenas os dados da sua empresa:

```bash
# Com token do OWNER da empresa A
curl -s http://localhost:3333/users \
  -H "Authorization: Bearer $OWNER_A_TOKEN"
# → retorna apenas usuários da empresa A

# Com token do OWNER da empresa B
curl -s http://localhost:3333/users \
  -H "Authorization: Bearer $OWNER_B_TOKEN"
# → retorna apenas usuários da empresa B
```

**Esperado:** cada query retorna dados exclusivos do próprio tenant (filtro automático via `prisma-tenant.extension.ts`).

---

## 8. Testar bloqueio por assinatura inativa

Para simular uma assinatura cancelada, atualize diretamente no banco via Prisma Studio:

```bash
npm run prisma:studio
# → abrir http://localhost:5555
# → Subscription → alterar status para CANCELED
```

Em seguida, tente qualquer `POST` protegido pelo `PlanLimitGuard`:

```bash
curl -s -X POST http://localhost:3333/users \
  -H "Authorization: Bearer $OWNER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{ "email": "x@x.com", "password": "x", "firstname": "X", "lastname": "Y", "role": "USER" }'
```

**Esperado:** `403 Forbidden`

```json
{ "message": "Your subscription is not active. Current status: CANCELED." }
```

---

## 9. Verificar via Swagger

Acesse `http://localhost:3333/docs`, clique em **Authorize** e cole o JWT Bearer token.

Todos os cenários acima podem ser reproduzidos via Swagger UI. Use o botão **Try it out** em cada endpoint.

---

## Resumo da Matriz de Permissões

| Ação                    | OWNER | ADMIN | SUPPORT | USER |
| ----------------------- | ----- | ----- | ------- | ---- |
| `POST /users`           | ✅    | ✅    | ✅      | ❌   |
| `GET /users`            | ✅    | ✅    | ✅      | ✅   |
| `POST /companies`       | ✅    | ✅    | ✅      | ❌   |
| `GET /companies`        | ✅    | ✅    | ✅      | ✅   |
| `PATCH /companies/:id`  | ✅    | ✅    | ✅      | ❌   |
| `DELETE /companies/:id` | ✅    | ✅    | ✅      | ❌   |

> Todas as rotas exigem assinatura **ACTIVE** ou **TRIALING** para as operações de escrita protegidas pelo `PlanLimitGuard`.
