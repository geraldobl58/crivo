# Crivo

Plataforma SaaS multi-tenant para gestão contábil com autenticação via Keycloak, pagamentos via Stripe e API Gateway via Kong.

---

## Stack

| Camada         | Tecnologia                                 |
| -------------- | ------------------------------------------ |
| Monorepo       | Turborepo + npm workspaces                 |
| Backend        | NestJS 11 · Prisma 7 · PostgreSQL 16       |
| Frontend       | Next.js 16 · React 19 · Tailwind CSS 4     |
| Autenticação   | Keycloak 26 — OpenID Connect (JWT RS256)   |
| Pagamentos     | Stripe (subscriptions + webhooks + portal) |
| Email          | Nodemailer (Mailtrap em dev)               |
| API Gateway    | Kong 3.9 (DB-less / declarativo)           |
| Logs           | Pino (pino-pretty em dev)                  |
| Documentação   | Swagger (OpenAPI) em `/docs`               |
| Infraestrutura | Docker Compose                             |

---

## Estrutura do Monorepo

```
crivo/
├── apps/
│   ├── crivo-be/         # API NestJS (porta 3333)
│   ├── crivo-fe/         # Frontend Next.js (porta 3000)
│   └── crivo-auth/       # Tema customizado do Keycloak (Tailwind CSS)
├── kong/                 # Configuração declarativa do Kong Gateway
├── scripts/              # Scripts de setup (Keycloak realm, etc.)
├── docker-compose.yml    # Infraestrutura local (PostgreSQL, Keycloak, Kong, Konga)
└── turbo.json            # Configuração do Turborepo
```

---

## Serviços (Docker Compose)

| Serviço    | Porta  | Descrição                                   |
| ---------- | ------ | ------------------------------------------- |
| PostgreSQL | `5432` | Banco de dados (crivo_app + crivo_keycloak) |
| Keycloak   | `8080` | Identity & Access Management                |
| Kong       | `8000` | API Gateway (proxy para os serviços)        |
| Konga      | `1337` | UI de administração do Kong                 |

---

## Pré-requisitos

- **Node.js** >= 20
- **Docker** e **Docker Compose**
- Conta no **Stripe** (test mode)
- Acesso ao **Mailtrap** (sandbox)

---

## Setup rápido

```bash
# 1. Instalar dependências
npm install

# 2. Subir infraestrutura (PostgreSQL + Keycloak + Kong + Konga)
docker compose up -d

# 3. Configurar o backend
cd apps/crivo-be
cp .env.example .env        # Preencher variáveis de ambiente
npm run prisma:migrate       # Aplicar migrations
npm run prisma:seed          # Popular planos

# 4. Iniciar tudo (da raiz)
cd ../..
npm run dev
```

---

## URLs de Desenvolvimento

| Recurso        | URL                                   |
| -------------- | ------------------------------------- |
| Frontend       | `http://localhost:3000`               |
| API (via Kong) | `http://localhost:8000/api`           |
| API (direto)   | `http://localhost:3333`               |
| Swagger        | `http://localhost:3333/docs`          |
| Keycloak Admin | `http://localhost:8080` (admin/admin) |
| Kong Admin API | `http://localhost:8001`               |
| Konga UI       | `http://localhost:1337`               |
| Prisma Studio  | `npm run prisma:studio` (em crivo-be) |

---

## Planos e Limites

| Plano        | Preço/mês    | Trial | Max Usuários | Max Empresas |
| ------------ | ------------ | ----- | ------------ | ------------ |
| TRIAL        | Gratuito     | 1 dia | 1            | 1            |
| BASIC        | R$ 19,90     | —     | 1            | 1            |
| PROFESSIONAL | R$ 49,90     | —     | 3            | 3            |
| ENTERPRISE   | Sob consulta | —     | Ilimitado    | Ilimitado    |

---

## Papéis de Acesso (Roles)

| Role      | Cria usuário | Edita empresa | Leitura geral |
| --------- | ------------ | ------------- | ------------- |
| `OWNER`   | ✅           | ✅            | ✅            |
| `ADMIN`   | ✅           | ✅            | ✅            |
| `USER`    | ❌           | ❌            | ✅            |
| `SUPPORT` | ✅           | ✅            | ✅            |

---

## Scripts

```bash
npm run dev          # Inicia todos os apps em modo dev (Turborepo)
npm run build        # Build de produção de todos os apps
npm run lint         # Lint em todos os apps
npm run format       # Formata todos os arquivos (Prettier)
npm run check-types  # Checagem de tipos em todos os apps
```

---

## Apps

### [`crivo-be`](apps/crivo-be/) — Backend API

API NestJS multi-tenant com:

- Autenticação via Keycloak (JWT RS256 / JWKS)
- CRUD de empresas, usuários e planos
- Integração Stripe (checkout, webhooks, portal do cliente)
- Email transacional (5 templates)
- Dashboard admin (métricas, impersonação)
- Guards de tenant isolation, ownership e limites de plano

### [`crivo-fe`](apps/crivo-fe/) — Frontend

Aplicação Next.js 16 com React 19 e Tailwind CSS 4.

### [`crivo-auth`](apps/crivo-auth/) — Tema Keycloak

Tema customizado de login para o Keycloak com Tailwind CSS. Hot-reload habilitado em desenvolvimento.

---

## Kong API Gateway

Configuração declarativa (DB-less) em [`kong/kong.yml`](kong/kong.yml):

- **Rate limiting** — 120 req/min por IP (1000/min para webhook do Stripe)
- **CORS** — Centralizado no gateway
- **Request size limit** — 50 MB
- **Correlation ID** — `X-Request-Id` em todos os requests
- **Proxy** — Rotas `/api` → Backend, `/auth` → Keycloak

---

## Documentação do Backend

A documentação completa está em [`apps/crivo-be/docs/`](apps/crivo-be/docs/):

| Arquivo                                                           | Conteúdo                                                |
| ----------------------------------------------------------------- | ------------------------------------------------------- |
| [01-SETUP.md](apps/crivo-be/docs/01-SETUP.md)                     | Infraestrutura, Keycloak, Stripe, variáveis de ambiente |
| [02-ARCHITECTURE.md](apps/crivo-be/docs/02-ARCHITECTURE.md)       | Clean Architecture, multi-tenancy, guards, Prisma       |
| [03-API.md](apps/crivo-be/docs/03-API.md)                         | Referência completa dos endpoints                       |
| [04-USER-JOURNEY.md](apps/crivo-be/docs/04-USER-JOURNEY.md)       | Fluxo: onboarding → autenticação → uso                  |
| [05-TESTING.md](apps/crivo-be/docs/05-TESTING.md)                 | Testes manuais: guards, limites de plano, tenant        |
| [06-STRIPE.md](apps/crivo-be/docs/06-STRIPE.md)                   | Configuração Stripe: produtos, prices, webhooks         |
| [07-PLANS.md](apps/crivo-be/docs/07-PLANS.md)                     | Plans CRUD: endpoints, modelo, decisões de design       |
| [08-SUBSCRIPTIONS.md](apps/crivo-be/docs/08-SUBSCRIPTIONS.md)     | Subscriptions API: assinatura do tenant, faturas        |
| [09-KEYCLOAK-ADMIN.md](apps/crivo-be/docs/09-KEYCLOAK-ADMIN.md)   | Keycloak Admin Service: CRUD de usuários, roles         |
| [10-CUSTOMER-PORTAL.md](apps/crivo-be/docs/10-CUSTOMER-PORTAL.md) | Customer Portal: gerenciamento via Stripe               |
| [11-MAIL.md](apps/crivo-be/docs/11-MAIL.md)                       | Email transacional: templates, Mailtrap, integração     |
| [12-ADMIN-DASHBOARD.md](apps/crivo-be/docs/12-ADMIN-DASHBOARD.md) | Admin Dashboard: métricas, listagem, impersonação       |
| [13-API-GATEWAY.md](apps/crivo-be/docs/13-API-GATEWAY.md)         | Kong API Gateway: rotas, plugins, segurança             |

---

## Licença

Projeto privado — todos os direitos reservados.
