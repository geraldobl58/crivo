# Feature: Onboarding

Responsável pelo fluxo completo de provisionamento de um novo usuário SaaS:
**seleção de plano → registro no Keycloak → sync na API → ativação da empresa → boas-vindas**.

---

## 📁 Estrutura

```
features/onboarding/
├── actions/index.ts   # Server Actions: syncAction, activateCompanyAction
├── hooks/index.ts     # useOnboarding (lê sessionStorage + chama syncAction)
├── http/index.ts      # Funções HTTP: syncWithCrivo, activateCompany
├── types/             # SyncResponse, MockPaymentResponse
└── README.md          # Este arquivo
```

---

## 🔄 Fluxo completo

```
①  Landing page: usuário clica em "Assinar [Plano]"
        ↓
②  SectionPrice.handleSubscribe():
       - sessionStorage.setItem("plan_id", planId)        ← client-side UI
       - setClientCookie("crivo_plan_id", planId, 600)    ← server-side OAuth
       - signIn("keycloak", { callbackUrl: "/secure/onboarding" })
        ↓
③  Keycloak: usuário preenche email + senha + nome
        ↓
④  NextAuth JWT callback (server-side, auth.ts):
       - Lê cookie "crivo_plan_id" via cookies() de next/headers
       - POST /auth/sync { plan_id } → cria Company + User com plano correto
       - Salva na sessão: companyId, planName, planId, role, isNewUser=true
        ↓
⑤  /secure/onboarding (page.tsx):
       - isNewUser=true → ativa empresa em background (POST /onboarding/mock-payment)
       - Mostra banner de boas-vindas com plano e botão "Ir para o Dashboard"
       - Remove cookies/sessionStorage temporários
        ↓
⑥  Usuário navega para o Dashboard
```

---

## 🍪 Por que Cookie + SessionStorage?

| Mecanismo | Lido por | Uso |
|---|---|---|
| `sessionStorage` | Client-side | Exibição do nome do plano antes/durante o redirect |
| Cookie `crivo_plan_id` | Server-side (`auth.ts`) | Passagem do plan_id durante o callback OAuth |

> **Problema raiz corrigido:** `sessionStorage` não sobrevive ao redirect externo para o Keycloak.
> O cookie sim — é enviado pelo browser ao retornar para `localhost:3000/api/auth/callback/keycloak`.

---

## 📡 Endpoints usados

| Método | Endpoint | Quando |
|---|---|---|
| `POST` | `/auth/sync` | Chamado pelo `auth.ts` durante o callback OAuth (server-side) |
| `POST` | `/onboarding/mock-payment` | Chamado pela onboarding page após `isNewUser=true` |

### `POST /auth/sync` — comportamento no backend

| Cenário | Resultado |
|---|---|
| Usuário **novo** | Cria Company + User com o `plan_id` enviado (HTTP 201) |
| Usuário **existente**, mesmo plano | Retorna dados (HTTP 200), sincroniza `plan_id` no Keycloak |
| Usuário **existente**, plano diferente | Atualiza plano da empresa + sincroniza no Keycloak (HTTP 200) |

---

## 🎛 Server Actions

### `syncAction(planId?)`

Chama `POST /auth/sync` server-side. Usado pelo hook `useOnboarding`.

```typescript
const result = await syncAction("00000000-0000-0000-0000-000000000002");
// result.data.company.plan_name === "professional"
```

### `activateCompanyAction(companyId)`

Chama `POST /onboarding/mock-payment` para ativar a empresa (`trialing → active`).
Será substituído pelo Stripe Checkout na versão de produção.

---

## ⚙️ Onboarding Page (`/secure/onboarding`)

### Novo usuário (`session.isNewUser === true`)
1. Executa ativação em background (`activateCompanyAction`) — não bloqueia a UI
2. Mostra banner verde **"Conta criada com sucesso! 🎉"** com chip do plano
3. Exibe spinner "Ativando conta…" durante a operação
4. Ao concluir, mostra **"✓ Conta ativada"** e botão **"Ir para o Dashboard"**
5. Remove `plan_id` e `plan_name` do sessionStorage

### Usuário retornante
1. Mostra banner azul "Bem-vindo ao Crivo!" com chip do plano
2. Checklist dos primeiros passos com links diretos
3. Placeholder do vídeo tutorial
4. Ações rápidas (Empresas, Transações, Documentos, Dashboard)

---

## 🔮 Futuro

- [ ] Integrar Stripe Checkout (substituir mock-payment)
- [ ] Checklist dinâmico: marcar passos concluídos com dados reais da API
- [ ] Vídeo tutorial real no placeholder
