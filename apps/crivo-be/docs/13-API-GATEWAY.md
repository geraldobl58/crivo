# API Gateway — Kong

Documentação do Kong API Gateway integrado à stack Crivo. Modo **DB-less** (declarativo) — toda configuração em `kong/kong.yml`.

---

## Visão geral

```
                    ┌─────────────────────────────────┐
                    │         Kong Gateway             │
   Frontend ──────→ │  :8000 (proxy) / :8001 (admin)  │
                    │                                  │
                    │  ┌── Rate Limiting ──┐           │
                    │  │   CORS            │           │
                    │  │   Bot Detection   │           │
                    │  │   Security Headers│           │
                    │  │   Request Size    │           │
                    │  │   Correlation ID  │           │
                    │  └───────────────────┘           │
                    └──────────┬──────────┬────────────┘
                               │          │
                    ┌──────────▼──┐  ┌────▼──────────┐
                    │  NestJS API │  │   Keycloak    │
                    │  :3333      │  │   :8080       │
                    └─────────────┘  └───────────────┘
```

O frontend e apps externas acessam tudo pela porta **8000** do Kong. O Kong roteia para o backend correto e aplica plugins de segurança/observabilidade.

---

## URLs

| Recurso        | URL direta (dev)               | Via Kong                           |
| -------------- | ------------------------------ | ---------------------------------- |
| API Backend    | `http://localhost:8000`        | `http://localhost:8000/api/*`      |
| Swagger        | `http://localhost:8000/docs`   | `http://localhost:8000/docs`       |
| Keycloak       | `http://localhost:8080`        | `http://localhost:8000/auth/*`     |
| Kong Admin API | —                              | `http://localhost:8001`            |
| Konga (UI)     | —                              | `http://localhost:1337`            |
| Health check   | `http://localhost:8000/health` | `http://localhost:8000/api/health` |

---

## Arquitetura

### DB-less (Declarative Mode)

O Kong roda **sem banco de dados**. Toda configuração vive em `kong/kong.yml` e é carregada na inicialização.

**Vantagens:**

- Zero dependências extras (sem PostgreSQL adicional)
- Config versionada no Git
- Startup mais rápido
- Ideal para dev e projetos com <= 3 services

**Quando migrar para DB mode:**

- Precisa de gestão dinâmica de routes em runtime
- Muitos services (5+) ou configuração dinâmica

> **Nota:** O Konga funciona com DB-less mode (conecta na Admin API). Em DB-less, a UI é **somente leitura** — alterações são feitas no `kong.yml`.

### Roteamento

```
http://localhost:8000/api/users       → strip /api → http://backend:3333/users
http://localhost:8000/api/plans       → strip /api → http://backend:3333/plans
http://localhost:8000/docs            → passthrough → http://backend:3333/docs
http://localhost:8000/auth/realms/... → strip /auth → http://keycloak:8080/realms/...
```

- `/api/*` — Strip de path: Kong remove `/api` antes de encaminhar ao backend
- `/docs` — Passthrough: URL preservada
- `/auth/*` — Strip de path: roteia para Keycloak

---

## Plugins configurados

### Por serviço (crivo-api)

| Plugin                  | Configuração                      | Descrição                        |
| ----------------------- | --------------------------------- | -------------------------------- |
| `rate-limiting`         | 120 req/min por IP                | Limita abuso, retorna 429        |
| `cors`                  | Origins: localhost:3000, :8000    | Headers, credentials, preflight  |
| `request-size-limiting` | 50 MB                             | Protege contra payloads gigantes |
| `file-log`              | stdout                            | Log de todas as requests (dev)   |
| `correlation-id`        | Header X-Request-Id, uuid#counter | Rastreamento end-to-end          |

### Por serviço (crivo-auth / Keycloak)

| Plugin          | Configuração      | Descrição                 |
| --------------- | ----------------- | ------------------------- |
| `rate-limiting` | 30 req/min por IP | Anti brute-force em login |

### Global (todas as rotas)

| Plugin                 | Configuração                   | Descrição                    |
| ---------------------- | ------------------------------ | ---------------------------- |
| `bot-detection`        | Deny: Scrapy, SemrushBot, etc. | Bloqueia scrapers conhecidos |
| `response-transformer` | Security headers               | X-Frame-Options, CSP, etc.   |

---

## Security Headers (via response-transformer)

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
```

---

## Comandos úteis

### Iniciar

```bash
docker compose up -d kong konga

# Verificar status
curl -s http://localhost:8001/status | jq

# Abrir Konga UI
open http://localhost:1337
```

### Testar rotas

```bash
# API via Kong
curl http://localhost:8000/api/plans

# Health check
curl http://localhost:8000/api/health

# Swagger
open http://localhost:8000/docs

# Keycloak via Kong
curl http://localhost:8000/auth/realms/crivo/.well-known/openid-configuration

# Ver configuração ativa
curl -s http://localhost:8001/services | jq
curl -s http://localhost:8001/routes | jq
curl -s http://localhost:8001/plugins | jq
```

### Recarregar config (sem restart)

```bash
# Faz POST da config atualizada para a Admin API
curl -X POST http://localhost:8001/config \
  -F config=@kong/kong.yml
```

### Validar config offline

```bash
docker run --rm -e KONG_DATABASE=off \
  -v ./kong/kong.yml:/kong/kong.yml:ro \
  kong:3.9 kong config parse /kong/kong.yml
```

### Logs

```bash
docker compose logs -f kong
```

---

## Konga — Admin UI

Interface visual para gerenciar e monitorar o Kong. Acesse em **http://localhost:1337**.

### Primeiro acesso

1. Abra `http://localhost:1337`
2. Crie uma conta de admin (local, só para o Konga)
3. Na tela de **Connections**, adicione:
   - **Name:** `crivo-kong-dev`
   - **Kong Admin URL:** `http://kong:8001`
4. Clique em **Connect**

### O que dá pra fazer

| Funcionalidade | Descrição                                          |
| -------------- | -------------------------------------------------- |
| **Dashboard**  | Status do Kong, uptime, conexões ativas            |
| **Services**   | Visualizar services configurados (crivo-api, auth) |
| **Routes**     | Ver rotas, paths, métodos, strip_path              |
| **Plugins**    | Todos os plugins ativos, config de cada um         |
| **Consumers**  | Gerenciar consumers (se usar autenticação no Kong) |
| **Upstreams**  | Health checks e targets dos upstreams              |

### Limitações em DB-less mode

Em DB-less, o Konga **pode visualizar** tudo mas **não pode criar/editar** services, routes ou plugins pela UI. Toda configuração continua sendo feita no `kong/kong.yml`.

Para habilitar edição completa pela UI, migre para DB mode (veja seção Produção).

---

## Rate Limiting — Comportamento

O rate limiting retorna headers informativos:

```
X-RateLimit-Limit-Minute: 120
X-RateLimit-Remaining-Minute: 119
```

Quando excedido:

```json
HTTP/1.1 429 Too Many Requests
{
  "message": "Rate limit exceeded. Please try again later."
}
```

### Configuração por route

Para dar rate limit diferente a uma rota específica (ex: webhook do Stripe), adicione um plugin no nível da route no `kong.yml`:

```yaml
routes:
  - name: stripe-webhook
    paths:
      - /api/stripe/webhook
    plugins:
      - name: rate-limiting
        config:
          minute: 1000 # webhooks precisam de mais headroom
```

---

## Correlation ID

Cada request recebe um `X-Request-Id` único (formato: `uuid#counter`).

```
X-Request-Id: 550e8400-e29b-41d4-a716-446655440000#1
```

Use para rastrear uma request do frontend → Kong → backend → logs.

---

## Adaptando para novos projetos (boilerplate)

Para reusar em outro projeto:

1. **Copie** `kong/kong.yml` e as seções `kong` + `konga` do `docker-compose.yml`
2. **Renomeie** os services (ex: `crivo-api` → `meu-projeto-api`)
3. **Ajuste** a URL do upstream (porta do backend)
4. **Ajuste** as origins do CORS
5. **Ajuste** o rate limiting conforme a necessidade
6. **No Konga**, crie uma nova connection apontando para o Kong do projeto

### Checklist por projeto

```yaml
# kong.yml — O que mudar:
services[0].url          → URL do seu backend
plugins.cors.origins     → URLs do seu frontend
plugins.rate-limiting    → Limites por minuto
routes[0].paths          → Prefixo das rotas
```

---

## Produção

Para produção, considere:

| Mudança                     | Por quê                                     |
| --------------------------- | ------------------------------------------- |
| Remover `KONG_ADMIN_LISTEN` | Admin API não deve ficar exposta            |
| `file-log` → `tcp-log`      | Enviar para Datadog/Grafana Loki            |
| `rate-limiting` → Redis     | `policy: redis` para rate limit distribuído |
| Adicionar `jwt` plugin      | Validar JWT no gateway (antes do app)       |
| Adicionar `prometheus`      | Métricas para Grafana                       |
| SSL termination             | Certificados no Kong, backend em HTTP       |
| IP restriction              | Whitelist de IPs em endpoints admin         |

### Rate Limiting com Redis (produção)

```yaml
- name: rate-limiting
  config:
    minute: 120
    policy: redis
    redis:
      host: redis
      port: 6379
```

### JWT Validation no gateway

```yaml
- name: jwt
  config:
    key_claim_name: iss
    claims_to_verify:
      - exp
```

---

## Notas técnicas

- **host.docker.internal** — Usado para acessar o NestJS rodando no host (fora do Docker). Em produção, usar nome do service Docker.
- **strip_path: true** — Remove o prefixo `/api` antes de encaminhar. O backend recebe `/plans`, não `/api/plans`.
- **trust proxy** — `main.ts` configura Express para confiar nos headers `X-Forwarded-For` do Kong.
- **CORS duplo** — CORS configurado tanto no Kong quanto no NestJS. Em produção, remova do NestJS e deixe só no Kong.
- **Health check** — `GET /health` retorna `{ status: "ok", timestamp: "..." }`. Kong pode usar para health checks ativo com upstreams.
