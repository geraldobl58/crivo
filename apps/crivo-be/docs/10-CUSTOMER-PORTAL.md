# Customer Portal — Gerenciamento de Assinatura pelo Stripe

Documentação do endpoint `POST /stripe/portal`. Permite ao usuário gerenciar a assinatura diretamente no Stripe Customer Portal sem precisar de UI no Crivo.

---

## Visão geral

O Stripe Customer Portal é uma **página hospedada pelo Stripe** onde o cliente pode:

- Trocar o **método de pagamento** (cartão de crédito)
- Fazer **upgrade/downgrade** de plano
- **Cancelar** a assinatura
- Ver **histórico de faturas** e baixar PDFs
- Atualizar **dados de cobrança** (endereço, nome)

O backend apenas gera uma URL de sessão autenticada e retorna para o frontend redirecionar.

---

## Arquitetura

```
src/internal/stripe/
├── stripe.service.ts                                  # createBillingPortalSession()
├── stripe.module.ts                                   # Registra o use-case
├── application/
│   └── use-cases/
│       └── create-portal-session.use-case.ts          # Lógica de negócio
└── infrastructure/
    └── http/
        ├── stripe.controller.ts                       # POST /stripe/portal
        └── dtos/
            └── portal-session-response.dto.ts         # { url: string }
```

---

## Endpoint

```
POST /stripe/portal
Authorization: Bearer <token>

Response 201:
{ "url": "https://billing.stripe.com/p/session/test_..." }
```

| Aspecto  | Detalhe                                  |
| -------- | ---------------------------------------- |
| Método   | `POST`                                   |
| Path     | `/stripe/portal`                         |
| Auth     | JWT Bearer (Keycloak)                    |
| Tenant   | `TenantInterceptor` — extrai `companyId` |
| Body     | Nenhum                                   |
| Response | `{ url: string }`                        |
| Status   | `201 Created`                            |

---

## Fluxo interno

```
  Usuário           Frontend          Backend              Stripe
    │                  │                  │                    │
    │── Clica          │                  │                    │
    │  "Gerenciar      │                  │                    │
    │   Assinatura"    │                  │                    │
    │                  ├── POST           │                    │
    │                  │   /stripe/portal │                    │
    │                  │   (Bearer token) │                    │
    │                  │                  │                    │
    │                  │                  ├── prisma.company   │
    │                  │                  │   .findUnique()    │
    │                  │                  │   → stripeCustomerId
    │                  │                  │                    │
    │                  │                  ├── billingPortal    │
    │                  │                  │   .sessions.create()
    │                  │                  │   { customer,      │
    │                  │                  │     return_url }   │
    │                  │                  │                   ──►
    │                  │                  │◄── { url } ────────│
    │                  │◄── { url } ──────│                    │
    │                  │                  │                    │
    │◄── redirect ─────│                  │                    │
    │                  │                  │                    │
    ├── Gerencia assinatura no Portal ───────────────────────►│
    │   (cancela, troca cartão, upgrade, etc.)                │
    │                  │                  │                    │
    │                  │                  │◄── webhooks ───────│
    │                  │                  │  subscription.*    │
    │                  │                  │  invoice.*         │
    │                  │                  │                    │
    │◄── return_url ───│  (/dashboard)    │                    │
```

### Passos do use-case

1. Recebe `companyId` via `TenantInterceptor`
2. Busca `company.stripeCustomerId` no Postgres
3. Se empresa não encontrada → `404 NotFoundException`
4. Se `stripeCustomerId` é `null` → `400 BadRequestException` (empresa sem assinatura)
5. Chama `stripe.createBillingPortalSession({ customerId, returnUrl })`
6. Retorna `{ url }` para redirect no frontend

---

## Código

### StripeService

```typescript
async createBillingPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<{ url: string }> {
  const session = await this.stripeClient.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });

  return { url: session.url };
}
```

### Use-Case

```typescript
@Injectable()
export class CreatePortalSessionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
  ) {}

  async execute(input: { companyId: string }): Promise<{ url: string }> {
    const company = await this.prisma.company.findUnique({
      where: { id: input.companyId },
      select: { stripeCustomerId: true },
    });

    if (!company) throw new NotFoundException('Empresa não encontrada');

    if (!company.stripeCustomerId) {
      throw new BadRequestException(
        'Empresa não possui assinatura ativa. Complete o onboarding primeiro.',
      );
    }

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    const session = await this.stripe.createBillingPortalSession({
      customerId: company.stripeCustomerId,
      returnUrl: `${frontendUrl}/dashboard`,
    });

    return { url: session.url };
  }
}
```

---

## Tratamento de erros

| Cenário                         | Exceção                        | Status |
| ------------------------------- | ------------------------------ | ------ |
| Empresa não encontrada          | `NotFoundException`            | 404    |
| Empresa sem `stripeCustomerId`  | `BadRequestException`          | 400    |
| Token inválido/ausente          | `UnauthorizedException`        | 401    |
| Falha na comunicação com Stripe | `InternalServerErrorException` | 500    |

---

## O que o usuário pode fazer no Portal

As ações disponíveis dependem da configuração no Stripe Dashboard:

| Ação                           | Configurável? | Padrão |
| ------------------------------ | ------------- | ------ |
| Trocar método de pagamento     | Sim           | ✅ On  |
| Cancelar assinatura            | Sim           | ✅ On  |
| Upgrade/downgrade de plano     | Sim           | ❌ Off |
| Visualizar/download de faturas | Sim           | ✅ On  |
| Atualizar dados de cobrança    | Sim           | ✅ On  |

> Configure em: **Stripe Dashboard → Settings → Customer portal**  
> ([https://dashboard.stripe.com/test/settings/billing/portal](https://dashboard.stripe.com/test/settings/billing/portal))

---

## Sincronização com webhooks

Quando o usuário faz alterações no Portal, o Stripe dispara webhooks que o backend **já processa**:

| Ação no Portal         | Webhook disparado               | Handler existente |
| ---------------------- | ------------------------------- | ----------------- |
| Cancela assinatura     | `customer.subscription.updated` | ✅                |
| Cancelamento efetivado | `customer.subscription.deleted` | ✅                |
| Troca de plano         | `customer.subscription.updated` | ✅                |
| Pagamento de fatura    | `invoice.payment_succeeded`     | ✅                |
| Pagamento falhou       | `invoice.payment_failed`        | ✅                |

> Nenhum webhook novo precisou ser adicionado — a Fase 2 já cobre todos os eventos relevantes.

---

## Pré-requisitos

1. **Ativar o Customer Portal no Stripe Dashboard**
   - Acesse: Settings → Customer portal
   - Configure quais ações estão habilitadas
   - Salve

2. **`stripeCustomerId` na Company**
   - Criado automaticamente no onboarding (`POST /onboarding/setup-company`)
   - Ou no primeiro checkout (`POST /stripe/checkout`)

3. **Variáveis de ambiente** (já existentes)
   - `STRIPE_SECRET_KEY`
   - `FRONTEND_URL` — URL de retorno após o portal (`/dashboard`)

---

## Notas

- **Sem UI adicional no backend** — o Stripe hospeda toda a interface do portal
- **Sem body na request** — o `companyId` vem do JWT via `TenantInterceptor`
- **`return_url`** aponta para `/dashboard` — o usuário volta ao app após sair do portal
- **Webhooks existentes** capturam todas as mudanças feitas no portal
- **Sessão expira** — a URL gerada é de uso único e expira após um curto período
