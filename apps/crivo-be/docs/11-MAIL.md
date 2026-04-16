# Módulo de Email — Notificações Transacionais

Documentação do módulo `MailModule` (`src/libs/mail/`). Envia emails transacionais via SMTP (Mailtrap em dev, configurável para produção).

---

## Visão geral

O módulo envia emails automáticos em resposta a eventos de negócio da plataforma. Usa **nodemailer** com Mailtrap como provider de sandbox.

| Trigger                         | Email                        | Enviado de                   |
| ------------------------------- | ---------------------------- | ---------------------------- |
| `checkout.session.completed`    | Boas-vindas + instruções     | `HandleStripeWebhookUseCase` |
| `invoice.payment_succeeded`     | Confirmação de pagamento     | `HandleStripeWebhookUseCase` |
| `invoice.payment_failed`        | Alerta + link para atualizar | `HandleStripeWebhookUseCase` |
| `customer.subscription.deleted` | Confirmação de cancelamento  | `HandleStripeWebhookUseCase` |
| Trial expirando (D-3)           | Alerta + link para upgrade   | Cron job (futuro)            |

---

## Arquitetura

```
src/libs/mail/
├── mail.service.ts         # Serviço com métodos de envio
├── mail.module.ts          # @Global() module
└── templates/
    └── index.ts            # Templates HTML inline
```

O módulo é `@Global()`, portanto qualquer módulo pode injetar `MailService` sem importar `MailModule` explicitamente.

---

## Variáveis de ambiente

| Variável            | Descrição               | Exemplo                    |
| ------------------- | ----------------------- | -------------------------- |
| `MAILTRAP_HOST`     | Host SMTP               | `sandbox.smtp.mailtrap.io` |
| `MAILTRAP_PORT`     | Porta SMTP              | `587`                      |
| `MAILTRAP_USER`     | Usuário SMTP            | `619b341dfa93e8`           |
| `MAILTRAP_PASSWORD` | Senha SMTP              | `4c2771fe509498`           |
| `FRONTEND_URL`      | URL do frontend (links) | `http://localhost:3000`    |

---

## Métodos do MailService

### `send(input: SendMailInput)`

Método base — envia qualquer email com HTML arbitrário.

```typescript
await mail.send({
  to: 'usuario@empresa.com',
  subject: 'Assunto',
  html: '<h1>Conteúdo</h1>',
});
```

> **Best-effort:** se o envio falhar, o erro é logado mas **não lança exceção**. O fluxo principal nunca é bloqueado por falha de email.

---

### `sendWelcome(input)`

Enviado após o onboarding (`POST /onboarding/setup-company`).

```typescript
await mail.sendWelcome({
  to: 'owner@empresa.com',
  companyName: 'Empresa XPTO',
  planType: 'PROFESSIONAL',
  frontendUrl: 'http://localhost:3000',
});
```

**Conteúdo:** Boas-vindas + próximos passos + botão "Acessar Dashboard".

---

### `sendPaymentSucceeded(input)`

Enviado quando `invoice.payment_succeeded` é recebido pelo webhook.

```typescript
await mail.sendPaymentSucceeded({
  to: 'owner@empresa.com',
  companyName: 'Empresa XPTO',
  amountPaid: 4990, // em centavos
  currency: 'brl',
  invoiceId: 'in_1234',
});
```

**Conteúdo:** Confirmação com valor formatado (R$ 49,90) + ID da fatura.

---

### `sendPaymentFailed(input)`

Enviado quando `invoice.payment_failed` é recebido pelo webhook.

```typescript
await mail.sendPaymentFailed({
  to: 'owner@empresa.com',
  companyName: 'Empresa XPTO',
  amountDue: 4990,
  currency: 'brl',
  portalUrl: 'https://billing.stripe.com/...', // opcional
});
```

**Conteúdo:** Alerta vermelho + botão para atualizar método de pagamento.

---

### `sendSubscriptionCanceled(input)`

Enviado quando `customer.subscription.deleted` é recebido pelo webhook.

```typescript
await mail.sendSubscriptionCanceled({
  to: 'owner@empresa.com',
  companyName: 'Empresa XPTO',
});
```

**Conteúdo:** Confirmação de cancelamento + aviso de retenção de dados por 30 dias.

---

### `sendTrialExpiring(input)`

Preparado para uso futuro com cron job.

```typescript
await mail.sendTrialExpiring({
  to: 'owner@empresa.com',
  companyName: 'Empresa XPTO',
  daysLeft: 3,
  frontendUrl: 'http://localhost:3000',
});
```

**Conteúdo:** Alerta amarelo + botão "Ver planos".

---

## Integração com fluxos existentes

### Onboarding + Checkout

```
POST /onboarding/setup-company
  └── OnboardCompanyUseCase.execute()
        ├── ... cria empresa, subscription (INCOMPLETE), checkout URL ...
        └── (nenhum email — aguarda pagamento)

POST /stripe/webhook → checkout.session.completed
  └── HandleStripeWebhookUseCase.execute()
        ├── ... ativa subscription ...
        └── mail.sendWelcome()  ← Enviado após pagamento confirmado
```

### Webhooks Stripe

```
POST /stripe/webhook
  └── HandleStripeWebhookUseCase.execute()
        ├── invoice.payment_succeeded
        │     └── mail.sendPaymentSucceeded()  ← NOVO
        ├── invoice.payment_failed
        │     └── mail.sendPaymentFailed()  ← NOVO
        └── customer.subscription.deleted
              └── mail.sendSubscriptionCanceled()  ← NOVO
```

### Destinatário

Todos os emails são enviados ao **OWNER da empresa** (`role: 'OWNER'`). O serviço busca o owner via:

```typescript
const owner = await this.prisma.user.findFirst({
  where: { companyId: subscription.companyId, role: 'OWNER' },
  select: { email: true, company: { select: { name: true } } },
});
```

---

## Templates

Os templates usam HTML inline (sem engine de templating externa) com design responsivo e compatibilidade com Gmail/Outlook.

**Estrutura do layout:**

```
┌────────────────────────────────────────┐
│  CRIVO (header azul #1e40af)           │
├────────────────────────────────────────┤
│                                        │
│  Título                                │
│  Texto do corpo                        │
│  [ Botão azul ]                        │
│                                        │
├────────────────────────────────────────┤
│  Footer cinza (texto automático)       │
└────────────────────────────────────────┘
```

**Formatação de moeda:**

```typescript
// Converte centavos → moeda formatada por locale
formatCurrency(4990, 'brl') → 'R$ 49,90'
formatCurrency(999, 'usd') → '$9.99'
```

---

## Notas técnicas

- **Best-effort:** nenhum email bloqueia o fluxo principal — falhas são logadas e ignoradas
- **`@Global()`:** injetável em qualquer módulo sem import
- **nodemailer direto:** sem `@nestjs-modules/mailer` — implementação leve com `nodemailer.createTransport()`
- **Templates inline:** sem Handlebars/EJS — funções TypeScript puras retornando HTML string
- **Mailtrap sandbox:** em dev, emails vão para a inbox do Mailtrap (não entregues de verdade)
- **Produção:** trocar `MAILTRAP_*` por variáveis de um provider real (Resend, SendGrid, SES)
- **Trial expiring:** template pronto, pendente implementação do cron job (Fase futura)
