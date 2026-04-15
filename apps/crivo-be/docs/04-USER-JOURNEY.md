# Jornada do Usuário — Passo a Passo

Fluxo completo desde o primeiro acesso até o uso diário da plataforma.

---

## Etapa 1 — Registro no Keycloak

```
1. Usuário acessa https://app.crivo.com.br
2. Frontend redireciona para Keycloak
3. Usuário clica em "Registrar"
4. Preenche: email, nome, sobrenome, senha
5. Keycloak cria a conta e retorna JWT com keycloakId (claim "sub")
```

> Neste momento o usuário **existe no Keycloak**, mas **ainda não tem empresa no Crivo**.

---

## Etapa 2 — Onboarding

Frontend detecta que o usuário não tem empresa e exibe o formulário de onboarding:

```
POST /onboarding (rota pública)

{
  "planType": "TRIAL",
  "keycloakId": "<sub do JWT>",
  "ownerEmail": "admin@empresa.com",
  "ownerFirstname": "Geraldo",
  "ownerLastname": "Luiz"
}
```

Backend cria:

- `User` → Role OWNER com plano pendente (`pendingPlanType`)

Em seguida o frontend redireciona para o **dashboard**, onde o usuário completa o cadastro da empresa (`POST /companies`).

---

## Etapa 3 — Autenticação e Acesso

```
1. Frontend envia JWT no header: Authorization: Bearer <token>
2. JwtAuthGuard valida a assinatura via JWKS (RS256)
3. TenantInterceptor resolve:
     keycloakId → User → Company → Subscription → Plan
4. TenantContext disponível para todos os use cases:
     { companyId, userId, keycloakId, planType }
```

---

## Etapa 4 — Operações Diárias

```
# Listar usuários da empresa (qualquer role autenticada)
GET /users

# Convidar colaborador (requer OWNER, ADMIN ou SUPPORT)
# RolesGuard: bloqueia USERs com 403
# PlanLimitGuard: verifica limite do plano
POST /users
{ "email": "colaborador@empresa.com", "role": "USER", ... }

# Limites por plano:
# Trial:        1 usuário
# Basic:        1 usuário
# Professional: 3 usuários
# Enterprise:   ilimitado

# Erro: role insuficiente
→ 403 Forbidden: "Access denied. Required roles: ADMIN, OWNER, SUPPORT. Your role: USER."

# Erro: limite atingido
→ 403 Forbidden: "User limit reached for your Trial plan. Current: 1/1."
```

---

## Etapa 5 — Upgrade de Plano

```
1. Usuário acessa a página de planos
2. Seleciona "Professional" (R$ 49,90/mês)
3. Frontend chama POST /stripe/checkout
4. Stripe redireciona para página de pagamento
5. Pagamento confirmado → webhook do Stripe
6. Backend atualiza Subscription.status = ACTIVE
7. Agora é possível adicionar até 3 usuários
```

---

## Resumo do Fluxo

```
Keycloak Register
      │
      ▼
POST /onboarding ──► User (OWNER) com pendingPlanType
      │
      ▼
Login Keycloak ──► JWT
      │
      ▼
Dashboard: POST /companies ──► Company + Subscription + ChartOfAccounts
      │
      ▼
Authorization: Bearer <token>
      │
      ├── GET /users          → lista da minha empresa
      ├── POST /users         → cria (com limite de plano)
      ├── GET /companies/:id  → dados da minha empresa
      ├── PATCH /companies/:id → atualiza minha empresa
      │
      ▼
Upgrade → POST /stripe/checkout → webhook → Subscription ACTIVE
```
