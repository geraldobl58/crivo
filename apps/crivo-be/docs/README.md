# Crivo Backend

API backend do Crivo — plataforma SaaS multi-tenant com autenticação via Keycloak e pagamento recorrente via Stripe.

## Stack

| Camada         | Tecnologia                               |
| -------------- | ---------------------------------------- |
| Framework      | NestJS 11                                |
| ORM            | Prisma 7 + PrismaPg (PostgreSQL)         |
| Autenticação   | Keycloak 26 — OpenID Connect (JWT RS256) |
| Pagamento      | Stripe (subscriptions + webhooks)        |
| Infraestrutura | Docker Compose                           |

---

## Quickstart

```bash
# 1. Subir infraestrutura (PostgreSQL + Keycloak)
docker compose up -d

# 2. Instalar dependências
cd apps/crivo-be && npm install

# 3. Aplicar migrations e popular planos
npm run prisma:migrate
npm run prisma:seed

# 4. Iniciar em modo dev
npm run start:dev
```

| Recurso       | URL                          |
| ------------- | ---------------------------- |
| API           | `http://localhost:3333`      |
| Swagger       | `http://localhost:3333/docs` |
| Prisma Studio | `npm run prisma:studio`      |

---

## Planos e Limites

| Plano        | Preço/mês    | Trial | Max Usuários | Max Empresas |
| ------------ | ------------ | ----- | ------------ | ------------ |
| TRIAL        | Gratuito     | 1 dia | 1            | 1            |
| BASIC        | R$ 19,90     | —     | 1            | 1            |
| PROFESSIONAL | R$ 49,90     | —     | 3            | 3            |
| ENTERPRISE   | Sob consulta | —     | Ilimitado    | Ilimitado    |

---

## Papéis de acesso (Roles)

| Role      | Cria usuário | Edita empresa | Leitura geral |
| --------- | ------------ | ------------- | ------------- |
| `OWNER`   | ✅           | ✅            | ✅            |
| `ADMIN`   | ✅           | ✅            | ✅            |
| `USER`    | ❌           | ❌            | ✅            |
| `SUPPORT` | ✅           | ✅            | ✅            |

---

## Documentação

| Arquivo                                    | Conteúdo                                                |
| ------------------------------------------ | ------------------------------------------------------- |
| [01-SETUP.md](./01-SETUP.md)               | Infraestrutura, Keycloak, Stripe, variáveis de ambiente |
| [02-ARCHITECTURE.md](./02-ARCHITECTURE.md) | Clean Architecture, multi-tenancy, guards, Prisma       |
| [03-API.md](./03-API.md)                   | Referência completa dos endpoints                       |
| [04-USER-JOURNEY.md](./04-USER-JOURNEY.md) | Fluxo completo: onboarding → autenticação → uso         |
| [05-TESTING.md](./05-TESTING.md)           | Testes manuais: guards, limites de plano, tenant        |
| [06-STRIPE.md](./06-STRIPE.md)             | Configuração do Stripe: produtos, prices, webhooks      |
