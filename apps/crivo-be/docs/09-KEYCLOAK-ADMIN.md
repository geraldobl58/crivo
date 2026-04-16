# Keycloak Admin Service — Gerenciamento de Usuários

Documentação do serviço `KeycloakAdminService` (`src/libs/keycloak/`). Permite ao backend criar e gerenciar usuários no Keycloak programaticamente via Admin REST API.

---

## Visão geral

O serviço encapsula as operações da [Keycloak Admin REST API](https://www.keycloak.org/docs-api/latest/rest-api/) usando **Client Credentials Grant** para autenticação. O token é cacheado em memória com margem de 30s antes da expiração.

```
Backend (NestJS)
  │
  ├── createUser()       → POST   /admin/realms/crivo/users
  ├── updateUser()       → PUT    /admin/realms/crivo/users/:id
  ├── assignRealmRole()  → POST   /admin/realms/crivo/users/:id/role-mappings/realm
  ├── resetPassword()    → PUT    /admin/realms/crivo/users/:id/reset-password
  ├── deleteUser()       → DELETE /admin/realms/crivo/users/:id
  └── findUserByEmail()  → GET    /admin/realms/crivo/users?email=...&exact=true
```

---

## Arquitetura

```
src/libs/keycloak/
├── keycloak-admin.service.ts   # Serviço com todas as operações
└── keycloak-admin.module.ts    # @Global() module — disponível em toda a app
```

O módulo é `@Global()`, portanto qualquer módulo pode injetar `KeycloakAdminService` sem precisar importar `KeycloakAdminModule` explicitamente.

### Relação com o módulo de Usuários

O gerenciamento de usuários no Crivo envolve **dois stores de dados** que devem estar sincronizados:

| Store        | Responsabilidade                                      | Identificador                 |
| ------------ | ----------------------------------------------------- | ----------------------------- |
| **Keycloak** | Autenticação, credenciais, roles, sessões             | `keycloakId` (UUID)           |
| **Postgres** | Dados de negócio (empresa, plano, role interna, etc.) | `id` (UUID) + `keycloakId` FK |

```
┌──────────────────────────────────────────────────────────┐
│                   Keycloak (IdP)                         │
│  ┌──────────────────────────────────────────────────┐    │
│  │ User: sub=abc-123                                │    │
│  │  ├── email / username                            │    │
│  │  ├── firstName / lastName                        │    │
│  │  ├── credentials (password, OTP)                 │    │
│  │  ├── enabled / emailVerified                     │    │
│  │  └── realm roles: [owner, admin, user, support]  │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
           │  keycloakId = sub
           ▼
┌──────────────────────────────────────────────────────────┐
│                 Postgres (App DB)                         │
│  ┌──────────────────────────────────────────────────┐    │
│  │ User: id=uuid, keycloakId=abc-123                │    │
│  │  ├── email / firstname / lastname                │    │
│  │  ├── role: OWNER | ADMIN | USER | SUPPORT        │    │
│  │  ├── companyId → Company                         │    │
│  │  └── pendingPlanType                             │    │
│  └──────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────┘
```

> O campo `keycloakId` no Postgres é o **`sub` do JWT** — a mesma string retornada na `Location` header ao criar o usuário via Admin API.

---

## Fluxo de vida de um usuário

### 1. Registro e JIT Provisioning

O Crivo usa **Just-in-Time (JIT) Provisioning**. O usuário se registra diretamente no Keycloak (tela de registro do theme `nexo`) e, no primeiro login, o `JwtStrategy` cria automaticamente o registro no Postgres:

```
  Usuário                    Keycloak                   Backend (NestJS)
     │                          │                              │
     ├── Registra na tela ─────►│                              │
     │   (email + senha)        │                              │
     │                          │  cria User no realm crivo    │
     │◄── Token JWT ────────────│                              │
     │                          │                              │
     ├── GET /api (com token) ──┼─────────────────────────────►│
     │                          │                              ├── JwtStrategy.validate()
     │                          │                              │   ├── findUnique({ keycloakId: sub })
     │                          │                              │   ├── Se NÃO existe:
     │                          │                              │   │   └── prisma.user.create({
     │                          │                              │   │       keycloakId: sub,
     │                          │                              │   │       email, firstname, lastname,
     │                          │                              │   │       role: OWNER
     │                          │                              │   │     })
     │                          │                              │   └── Retorna payload para req.user
     │◄─────────────────────────┼── Resposta ──────────────────│
```

**Código relevante** (`src/libs/auth/jwt.strategy.ts`):

```typescript
async validate(payload: JwtPayload): Promise<JwtPayload> {
  const existing = await this.prisma.user.findUnique({
    where: { keycloakId: payload.sub },
  });

  if (!existing) {
    await this.prisma.user.create({
      data: {
        keycloakId: payload.sub,
        email: payload.email ?? payload.preferred_username ?? `${payload.sub}@unknown`,
        firstname: payload.given_name ?? null,
        lastname: payload.family_name ?? null,
        role: 'OWNER',
      },
    });
  }

  return payload;
}
```

> O usuário JIT é criado **sem empresa** (`companyId = null`). O próximo passo é o onboarding.

### 2. Onboarding (setup de empresa)

Após o JIT, o owner chama `POST /onboarding/setup-company` com `planType` e `companyName`. Esse fluxo:

1. Cria o **Stripe Customer**
2. Cria a **Company** no Postgres
3. Cria a **Subscription** com status `INCOMPLETE`
4. Vincula o usuário à empresa como `OWNER`
5. Retorna a **Checkout URL** do Stripe

```
  Owner                     Backend                       Stripe
    │                          │                             │
    ├── POST /onboarding/ ────►│                             │
    │   setup-company          │                             │
    │   { planType, name }     ├── createCustomer() ────────►│
    │                          │◄── customer.id ─────────────│
    │                          │                             │
    │                          ├── $transaction:             │
    │                          │   company.create()          │
    │                          │   subscription.create()     │
    │                          │   user.update(companyId)    │
    │                          │                             │
    │                          ├── createCheckoutSession() ─►│
    │                          │◄── session.url ─────────────│
    │◄── { checkoutUrl } ──────│                             │
    │                          │                             │
    ├── Redirect to Stripe ────┼────────────────────────────►│
```

### 3. Criação de usuários pelo Admin (via API)

Após o onboarding, **OWNER** e **ADMIN** podem criar usuários adicionais na empresa via `POST /users`. Neste caso, o `KeycloakAdminService` é usado para criar o usuário no Keycloak antes de registrar no Postgres.

```
  Admin                    Backend                      Keycloak
    │                         │                            │
    ├── POST /users ─────────►│                            │
    │   { email, name,        │                            │
    │     role, password }    ├── createUser() ───────────►│
    │                         │◄── { keycloakId } ─────────│
    │                         │                            │
    │                         ├── assignRealmRole() ──────►│
    │                         │◄── 204 ────────────────────│
    │                         │                            │
    │                         ├── userRepository.create({  │
    │                         │     keycloakId, email,     │
    │                         │     companyId, role        │
    │                         │   })                       │
    │◄── UserResponseDto ─────│                            │
```

### 4. Atualização e exclusão

| Operação          | Keycloak                         | Postgres                  |
| ----------------- | -------------------------------- | ------------------------- |
| Atualizar email   | `updateUser()` (email+user)      | `userRepository.update()` |
| Atualizar nome    | `updateUser()` (first/last)      | `userRepository.update()` |
| Alterar role      | `assignRealmRole()`              | `userRepository.update()` |
| Desativar usuário | `updateUser({ enabled: false })` | —                         |
| Resetar senha     | `resetPassword()`                | —                         |
| Deletar usuário   | `deleteUser()` (idempotente)     | `userRepository.delete()` |

> **Importante:** operações que alteram dados duplicados (email, nome) devem sincronizar ambos os stores. A ordem recomendada é **Keycloak primeiro**, depois Postgres — se o Keycloak falhar (503), o Postgres não fica inconsistente.

---

## Autenticação com a Admin API

Usa **Client Credentials Grant** com o client `crivo-api`:

```
POST /realms/crivo/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
client_id=crivo-api
client_secret=<KEYCLOAK_CLIENT_SECRET>
```

### Variáveis de ambiente

| Variável                 | Descrição                | Exemplo                 |
| ------------------------ | ------------------------ | ----------------------- |
| `KEYCLOAK_BASE_URL`      | URL base do Keycloak     | `http://localhost:8080` |
| `KEYCLOAK_REALM`         | Nome do realm            | `crivo`                 |
| `KEYCLOAK_CLIENT_ID`     | Client ID do backend     | `crivo-api`             |
| `KEYCLOAK_CLIENT_SECRET` | Client Secret do backend | `ZGYQ8zh7...`           |

> Todas já configuradas no `.env` existente.

### Cache de token

O access token é mantido em memória e reutilizado até 30 segundos antes da expiração. Isso evita chamadas desnecessárias ao endpoint de token a cada operação.

```typescript
// Lógica interna de cache
private async getAccessToken(): Promise<string> {
  const now = Date.now();
  if (this.tokenCache && this.tokenCache.expiresAt > now) {
    return this.tokenCache.accessToken; // Cache hit
  }
  // ... obtém novo token ...
  this.tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + (data.expires_in - 30) * 1000, // 30s de margem
  };
}
```

### Método `request()` — wrapper HTTP

Todas as operações passam pelo método privado `request(method, path, body?)`, que:

1. Obtém (ou reutiliza) o access token via `getAccessToken()`
2. Adiciona o header `Authorization: Bearer <token>`
3. Serializa o body como JSON (quando presente)
4. Faz `fetch()` contra `{baseUrl}/admin/realms/{realm}{path}`

---

## Interfaces e Tipos

```typescript
// Input para createUser()
interface KeycloakCreateUserInput {
  email: string;
  firstName?: string; // Default: ''
  lastName?: string; // Default: ''
  password: string;
  temporary?: boolean; // Default: false — se true, exige troca no primeiro login
  enabled?: boolean; // Default: true
}

// Retorno de createUser()
interface KeycloakCreateUserResult {
  keycloakId: string; // UUID extraído do header Location
}

// Input para updateUser()
interface KeycloakUpdateUserInput {
  email?: string; // Também atualiza username
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
}

// Input para resetPassword()
interface KeycloakResetPasswordInput {
  password: string;
  temporary?: boolean; // Default: false
}
```

---

## Operações — Referência detalhada

### `createUser(input: KeycloakCreateUserInput): Promise<KeycloakCreateUserResult>`

Cria um usuário no Keycloak com email, nome e senha.

**Endpoint:** `POST /admin/realms/crivo/users`

**Payload enviado ao Keycloak:**

```json
{
  "email": "usuario@empresa.com",
  "username": "usuario@empresa.com",
  "firstName": "João",
  "lastName": "Silva",
  "enabled": true,
  "emailVerified": true,
  "credentials": [
    {
      "type": "password",
      "value": "SenhaSegura123!",
      "temporary": false
    }
  ]
}
```

**Exemplo de uso:**

```typescript
const result = await keycloakAdmin.createUser({
  email: 'usuario@empresa.com',
  firstName: 'João',
  lastName: 'Silva',
  password: 'SenhaSegura123!',
  temporary: false,
  enabled: true,
});

// result.keycloakId → "f47ac10b-58cc-4372-a567-0e02b2c3d479"
```

**Comportamento:**

- `emailVerified` é setado como `true` automaticamente (o Crivo não exige verificação extra)
- `username` é setado como o `email` (padrão do Crivo — login por email)
- O `keycloakId` é extraído do header `Location` da resposta 201 (`/users/{id}`)
- Se o email já existe no Keycloak (409), lança `ServiceUnavailableException`
- Se o Keycloak não retornar o header `Location`, lança `ServiceUnavailableException`

**Campos com defaults:**

| Campo       | Default | Descrição                                         |
| ----------- | ------- | ------------------------------------------------- |
| `firstName` | `''`    | Enviado como string vazia se não fornecido        |
| `lastName`  | `''`    | Enviado como string vazia se não fornecido        |
| `enabled`   | `true`  | Usuário nasce ativo                               |
| `temporary` | `false` | Se `true`, força troca de senha no primeiro login |

---

### `updateUser(keycloakId: string, input: KeycloakUpdateUserInput): Promise<void>`

Atualiza email, nome ou status de ativação.

**Endpoint:** `PUT /admin/realms/crivo/users/{keycloakId}`

**Exemplo:**

```typescript
await keycloakAdmin.updateUser(keycloakId, {
  email: 'novo@empresa.com',
  firstName: 'João Carlos',
  lastName: 'Silva',
  enabled: false,
});
```

**Comportamento:**

- **Partial update:** apenas campos fornecidos são incluídos no payload
- Atualizar `email` também atualiza `username` automaticamente (mantém a convenção do Crivo)
- Lança `ServiceUnavailableException` se o Keycloak retornar erro

**Payload condicional (exemplo com apenas email):**

```json
{
  "email": "novo@empresa.com",
  "username": "novo@empresa.com"
}
```

---

### `assignRealmRole(keycloakId: string, roleName: string): Promise<void>`

Atribui uma realm role ao usuário. Operação em **duas etapas**.

**Etapa 1 — Buscar o role object:**

```
GET /admin/realms/crivo/roles/{roleName}
→ { "id": "role-uuid", "name": "owner" }
```

**Etapa 2 — Atribuir ao usuário:**

```
POST /admin/realms/crivo/users/{keycloakId}/role-mappings/realm
Body: [{ "id": "role-uuid", "name": "owner" }]
```

**Exemplo:**

```typescript
await keycloakAdmin.assignRealmRole(keycloakId, 'owner');
```

**Roles disponíveis no Crivo:**

| Role Keycloak | Role Postgres | Descrição       |
| ------------- | ------------- | --------------- |
| `owner`       | `OWNER`       | Dono da empresa |
| `admin`       | `ADMIN`       | Administrador   |
| `user`        | `USER`        | Usuário comum   |
| `support`     | `SUPPORT`     | Suporte técnico |

> **Pré-requisito:** as roles devem estar cadastradas no realm do Keycloak antes do uso.

---

### `resetPassword(keycloakId: string, input: KeycloakResetPasswordInput): Promise<void>`

Força troca ou reset de senha.

**Endpoint:** `PUT /admin/realms/crivo/users/{keycloakId}/reset-password`

**Payload:**

```json
{
  "type": "password",
  "value": "NovaSenha456!",
  "temporary": true
}
```

**Exemplo:**

```typescript
// Reset com troca obrigatória
await keycloakAdmin.resetPassword(keycloakId, {
  password: 'NovaSenha456!',
  temporary: true, // Exige troca no próximo login
});

// Reset definitivo
await keycloakAdmin.resetPassword(keycloakId, {
  password: 'NovaSenha456!',
  // temporary default = false
});
```

---

### `deleteUser(keycloakId: string): Promise<void>`

Remove o usuário do Keycloak.

**Endpoint:** `DELETE /admin/realms/crivo/users/{keycloakId}`

**Exemplo:**

```typescript
await keycloakAdmin.deleteUser(keycloakId);
```

**Comportamento:**

- **Idempotente:** se o usuário já não existir (404), apenas loga um warning e retorna sem erro
- Para qualquer outro erro, lança `ServiceUnavailableException`

---

### `findUserByEmail(email: string): Promise<{ keycloakId: string; email: string } | null>`

Busca um usuário no Keycloak por email (exact match).

**Endpoint:** `GET /admin/realms/crivo/users?email={email}&exact=true`

**Exemplo:**

```typescript
const user = await keycloakAdmin.findUserByEmail('usuario@empresa.com');

if (user) {
  console.log(user.keycloakId, user.email);
} else {
  console.log('Usuário não encontrado no Keycloak');
}
```

**Retorna:** `{ keycloakId, email }` ou `null` se não encontrado.

> O parâmetro `exact=true` garante que a busca é por match exato (sem substring match).

---

## Uso — Injeção de dependência

Como o módulo é `@Global()`, basta injetar em qualquer service/use-case:

```typescript
import { KeycloakAdminService } from '../../../libs/keycloak/keycloak-admin.service';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly keycloakAdmin: KeycloakAdminService,
  ) {}

  async execute(data: CreateUserInput) {
    // 1. Cria no Keycloak primeiro (se falhar, não toca no Postgres)
    const { keycloakId } = await this.keycloakAdmin.createUser({
      email: data.email,
      firstName: data.firstname,
      lastName: data.lastname,
      password: data.password,
    });

    // 2. Atribui role no Keycloak
    await this.keycloakAdmin.assignRealmRole(
      keycloakId,
      data.role.toLowerCase(),
    );

    // 3. Cria no banco local com o keycloakId
    return this.userRepository.create({
      keycloakId,
      email: data.email,
      firstname: data.firstname,
      lastname: data.lastname,
      role: data.role,
      companyId: data.companyId,
    });
  }
}
```

---

## Modelo de dados — Prisma

```prisma
model User {
  id              String    @id @default(uuid())
  keycloakId      String    @unique
  email           String    @unique
  firstname       String?
  lastname        String?
  role            Role      @default(USER)
  companyId       String?
  pendingPlanType PlanType?
  company         Company?  @relation(fields: [companyId], references: [id])
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

enum Role {
  OWNER
  ADMIN
  USER
  SUPPORT
}
```

**Relação UserEntity ↔ Keycloak fields:**

| UserEntity (Postgres) | Keycloak User        | Sincronizado? |
| --------------------- | -------------------- | ------------- |
| `keycloakId`          | `id` (sub)           | Read-only     |
| `email`               | `email` + `username` | Sim           |
| `firstname`           | `firstName`          | Sim           |
| `lastname`            | `lastName`           | Sim           |
| `role`                | realm roles          | Sim           |
| `companyId`           | —                    | Só Postgres   |
| `pendingPlanType`     | —                    | Só Postgres   |

---

## API REST — Endpoints do módulo Users

Os endpoints usam o `TenantInterceptor` para escopo multi-tenant (filtra por `companyId`).

| Método   | Endpoint     | Guard/Roles                                             | Descrição                            |
| -------- | ------------ | ------------------------------------------------------- | ------------------------------------ |
| `POST`   | `/users`     | `RolesGuard` + `PlanLimitGuard` (ADMIN, OWNER, SUPPORT) | Criar usuário na empresa             |
| `GET`    | `/users`     | —                                                       | Listar usuários (paginado + filtros) |
| `GET`    | `/users/:id` | —                                                       | Buscar usuário por ID                |
| `PATCH`  | `/users/:id` | —                                                       | Atualizar dados do usuário           |
| `DELETE` | `/users/:id` | —                                                       | Remover usuário                      |

**Criação de usuário — guards em sequência:**

1. **`RolesGuard`** — apenas `ADMIN`, `OWNER` ou `SUPPORT` podem criar
2. **`PlanLimitGuard`** — verifica se o plano da empresa comporta mais usuários (`@PlanResource('users')`)

---

## Pré-requisitos no Keycloak

Para que o `client_credentials` funcione, o client `crivo-api` deve ter:

1. **Service Account Roles** habilitado nas settings do client
2. As seguintes **Service Account Roles** atribuídas:
   - `realm-management` → `manage-users` (criar/editar/deletar usuários)
   - `realm-management` → `view-users` (buscar usuários)
   - `realm-management` → `manage-realm` (acessar roles)
3. As seguintes **Realm Roles** cadastradas:
   - `owner`
   - `admin`
   - `user`
   - `support`

Verifique em: Keycloak Admin Console → Clients → `crivo-api` → Service Account Roles.

---

## Tratamento de erros

Todos os métodos lançam `ServiceUnavailableException` (503) quando a comunicação com o Keycloak falha. Isso permite que a camada acima decida como tratar:

| Cenário                           | Método            | Exceção / Comportamento             |
| --------------------------------- | ----------------- | ----------------------------------- |
| Token não obtido                  | `getAccessToken`  | `ServiceUnavailableException`       |
| Email já existe no Keycloak (409) | `createUser`      | `ServiceUnavailableException`       |
| Header `Location` ausente         | `createUser`      | `ServiceUnavailableException`       |
| Role não encontrada               | `assignRealmRole` | `ServiceUnavailableException`       |
| Erro ao atribuir role             | `assignRealmRole` | `ServiceUnavailableException`       |
| Erro ao atualizar                 | `updateUser`      | `ServiceUnavailableException`       |
| Erro ao resetar senha             | `resetPassword`   | `ServiceUnavailableException`       |
| Keycloak fora do ar               | Qualquer          | `ServiceUnavailableException`       |
| Usuário não encontrado no delete  | `deleteUser`      | Log warning + retorna (idempotente) |
| Usuário não encontrado na busca   | `findUserByEmail` | Retorna `null`                      |

> O `Logger` do NestJS é usado em todos os cenários de erro para facilitar debugging em produção.

---

## Notas técnicas

- **Sem SDK externo** — implementado com `fetch()` nativo do Node.js (sem `@keycloak/keycloak-admin-client`)
- **Token cacheado** em memória com margem de 30s antes da expiração
- **Módulo `@Global()`** — não precisa importar `KeycloakAdminModule` em cada module que consumir
- **`deleteUser()` é idempotente** — não falha se o usuário já foi removido
- **`username` é sempre o `email`** — padrão adotado no Crivo para login por email
- **`emailVerified` fixo em `true`** — o Crivo não exige re-verificação via admin
- **Ordem de escrita: Keycloak → Postgres** — garante que o Postgres não fica inconsistente se o Keycloak falhar
