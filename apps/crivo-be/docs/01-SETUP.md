# Setup — Infraestrutura e Configuração

## Pré-requisitos

- Node.js >= 20
- Docker & Docker Compose
- Conta Stripe (sandbox)

---

## 1. Subindo a infraestrutura

Na raiz do monorepo:

```bash
docker compose up -d
```

| Serviço    | URL                     | Credenciais                |
| ---------- | ----------------------- | -------------------------- |
| PostgreSQL | `localhost:5432`        | `crivo` / `crivo_password` |
| Keycloak   | `http://localhost:8080` | `admin` / `admin`          |

Bancos criados automaticamente: `crivo_keycloak` e `crivo_db`.

---

## 2. Variáveis de Ambiente

Crie o arquivo `.env` na raiz de `apps/crivo-be/`:

```env
# App
PORT=3333
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://crivo:crivo_password@localhost:5432/crivo_db

# Keycloak
KEYCLOAK_BASE_URL=http://localhost:8080
KEYCLOAK_REALM=crivo
KEYCLOAK_CLIENT_ID=crivo-api
KEYCLOAK_CLIENT_SECRET=<copiar da aba Credentials do client crivo-api>
KEYCLOAK_WEB_CLIENT_ID=crivo-web
KEYCLOAK_JWKS_URI=http://localhost:8080/realms/crivo/protocol/openid-connect/certs
KEYCLOAK_ISSUER=http://localhost:8080/realms/crivo

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_TRIAL=price_xxx
STRIPE_PRICE_BASIC=price_xxx
STRIPE_PRICE_PROFESSIONAL=price_xxx
STRIPE_PRICE_ENTERPRISE=price_xxx
```

---

## 3. Configuração do Keycloak

### 3.1 Criar o Realm

1. Abra `http://localhost:8080` → login `admin` / `admin`
2. **Manage realms** → **Create realm**
3. **Realm name:** `crivo` → **Create**

### 3.2 Client `crivo-api` (Backend — confidential)

1. **Clients** → **Create client**
2. **Client ID:** `crivo-api` | **Client type:** OpenID Connect
3. **Capability config:**
   - Client authentication: `On`
   - Authorization: `On`
   - Authentication flows: Standard flow + Direct access grants + Service account roles
4. **Save** → aba **Credentials** → copie o **Client Secret**

**Service Account Roles** (para Admin API):

1. Aba **Service account roles** → **Assign role** → Filter by clients
2. Adicione: `realm-management → manage-users`, `view-users`, `manage-realm`

### 3.3 Client `crivo-web` (Frontend — public)

1. **Client ID:** `crivo-web` | Client authentication: `Off`
2. Authentication flows: Standard flow + Direct access grants
3. **Access settings:**
   - Root URL / Home URL: `http://localhost:3000`
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`

### 3.4 Realm Roles

Vá em **Realm roles** → **Create role** e crie:

| Role      | Descrição                |
| --------- | ------------------------ |
| `owner`   | Dono da conta            |
| `admin`   | Administrador da empresa |
| `user`    | Usuário comum            |
| `support` | Suporte do sistema       |

### 3.5 Theme customizado

O theme `nexo` é montado automaticamente via Docker Compose. Para ativar:

1. **Realm settings** → **Themes**
2. Login theme: `nexo` | Email theme: `nexo` → **Save**

### 3.6 Habilitar registro

1. **Realm settings** → **Login**
2. User registration: `On` | Email as username: `On` → **Save**

---

## 4. Configuração do Stripe

### 4.1 API Keys

No [Stripe Dashboard](https://dashboard.stripe.com) → **API keys**:

- `STRIPE_SECRET_KEY` → `sk_test_...`
- `STRIPE_PUBLISHABLE_KEY` → `pk_test_...`

### 4.2 Products e Prices

Em **Product catalog** → **Add product**:

| Product      | Preço (BRL/mês) |
| ------------ | --------------- |
| Trial        | R$ 0,00         |
| Basic        | R$ 19,90        |
| Professional | R$ 49,90        |
| Enterprise   | Customizado     |

Cada product: Pricing model `Recurring` · Billing period `Monthly` · Currency `BRL`.

Copie cada **Price ID** para as variáveis `STRIPE_PRICE_*` do `.env`.

### 4.3 Webhook

1. **Developers** → **Webhooks** → **Add endpoint**
2. URL: `https://seu-dominio.com/api/stripe/webhook`
3. Eventos: `checkout.session.completed`, `customer.subscription.*`, `invoice.*`
4. Copie o **Webhook Signing Secret** → `STRIPE_WEBHOOK_SECRET`

**Local (Stripe CLI):**

```bash
brew install stripe/stripe-cli/stripe
stripe login
stripe listen --forward-to localhost:3333/api/stripe/webhook
```

---

## 5. Executando o Backend

```bash
cd apps/crivo-be

npm install
npm run prisma:migrate   # cria as tabelas
npm run prisma:seed      # popula os planos
npm run start:dev
```

| Recurso       | URL                          |
| ------------- | ---------------------------- |
| API           | `http://localhost:3333`      |
| Swagger       | `http://localhost:3333/docs` |
| Prisma Studio | `npm run prisma:studio`      |
