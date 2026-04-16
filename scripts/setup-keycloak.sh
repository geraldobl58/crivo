#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════════
# Crivo — Keycloak Realm Setup (idempotent)
# ═══════════════════════════════════════════════════════════════════════════════
# Cria o realm "crivo" com clients, roles e usuário de teste.
# Pode ser rodado múltiplas vezes sem duplicar dados.
#
# Uso:
#   ./scripts/setup-keycloak.sh
#
# Pré-requisito: Keycloak rodando em localhost:8080 (docker compose up -d)
# ═══════════════════════════════════════════════════════════════════════════════
set -euo pipefail

KC_URL="http://localhost:8080"
REALM="crivo"
API_CLIENT_ID="crivo-api"
API_CLIENT_SECRET="ZGYQ8zh7IUQy2HFaazv84Abv1MjqWYer"
WEB_CLIENT_ID="crivo-web"
TEST_USER_EMAIL="janedoe@email.com"
TEST_USER_PASSWORD="123456"

# ── Cores ──────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}✅ $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
fail()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

# ── Aguarda Keycloak estar pronto ──────────────────────────────────────────
echo "⏳ Aguardando Keycloak em ${KC_URL}..."
for i in $(seq 1 60); do
  if curl -sf "${KC_URL}/realms/master" > /dev/null 2>&1; then
    break
  fi
  if [ "$i" -eq 60 ]; then
    fail "Keycloak não respondeu após 60 tentativas"
  fi
  sleep 2
done
info "Keycloak está pronto"

# ── Obtém token admin ─────────────────────────────────────────────────────
get_admin_token() {
  curl -sf -X POST "${KC_URL}/realms/master/protocol/openid-connect/token" \
    -H 'Content-Type: application/x-www-form-urlencoded' \
    -d 'grant_type=password&client_id=admin-cli&username=admin&password=admin' \
    | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])"
}

TOKEN=$(get_admin_token)
[ -z "$TOKEN" ] && fail "Não foi possível obter token admin"

# ── Helper para chamadas autenticadas ──────────────────────────────────────
kc_get()  { curl -sf -H "Authorization: Bearer ${TOKEN}" "$1"; }
kc_post() { curl -sf -o /dev/null -w "%{http_code}" -X POST -H "Authorization: Bearer ${TOKEN}" -H 'Content-Type: application/json' "$1" -d "$2"; }

# ═══════════════════════════════════════════════════════════════════════════════
# 1. Realm
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🔧 Configurando realm '${REALM}'..."

if kc_get "${KC_URL}/admin/realms/${REALM}" > /dev/null 2>&1; then
  warn "Realm '${REALM}' já existe — pulando criação"
else
  STATUS=$(kc_post "${KC_URL}/admin/realms" "{
    \"realm\": \"${REALM}\",
    \"enabled\": true,
    \"registrationAllowed\": true,
    \"registrationEmailAsUsername\": true,
    \"loginWithEmailAllowed\": true,
    \"duplicateEmailsAllowed\": false,
    \"resetPasswordAllowed\": true,
    \"editUsernameAllowed\": false,
    \"bruteForceProtected\": true,
    \"loginTheme\": \"nexo\",
    \"accountTheme\": \"nexo\",
    \"emailTheme\": \"nexo\"
  }")
  [ "$STATUS" = "201" ] && info "Realm '${REALM}' criado" || fail "Falha ao criar realm (HTTP ${STATUS})"
fi

# Refresh token (realm creation pode invalidar)
TOKEN=$(get_admin_token)

# ═══════════════════════════════════════════════════════════════════════════════
# 2. Client: crivo-api (confidential — backend service account)
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🔧 Configurando client '${API_CLIENT_ID}'..."

EXISTING=$(kc_get "${KC_URL}/admin/realms/${REALM}/clients?clientId=${API_CLIENT_ID}" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null || echo "")

if [ -n "$EXISTING" ]; then
  warn "Client '${API_CLIENT_ID}' já existe — pulando"
else
  STATUS=$(kc_post "${KC_URL}/admin/realms/${REALM}/clients" "{
    \"clientId\": \"${API_CLIENT_ID}\",
    \"name\": \"Crivo API\",
    \"enabled\": true,
    \"clientAuthenticatorType\": \"client-secret\",
    \"secret\": \"${API_CLIENT_SECRET}\",
    \"serviceAccountsEnabled\": true,
    \"directAccessGrantsEnabled\": true,
    \"publicClient\": false,
    \"protocol\": \"openid-connect\",
    \"standardFlowEnabled\": false
  }")
  [ "$STATUS" = "201" ] && info "Client '${API_CLIENT_ID}' criado" || fail "Falha ao criar client (HTTP ${STATUS})"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# 3. Client: crivo-web (public — frontend SPA)
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🔧 Configurando client '${WEB_CLIENT_ID}'..."

EXISTING=$(kc_get "${KC_URL}/admin/realms/${REALM}/clients?clientId=${WEB_CLIENT_ID}" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null || echo "")

if [ -n "$EXISTING" ]; then
  warn "Client '${WEB_CLIENT_ID}' já existe — pulando"
else
  STATUS=$(kc_post "${KC_URL}/admin/realms/${REALM}/clients" "{
    \"clientId\": \"${WEB_CLIENT_ID}\",
    \"name\": \"Crivo Web\",
    \"enabled\": true,
    \"publicClient\": true,
    \"directAccessGrantsEnabled\": true,
    \"standardFlowEnabled\": true,
    \"implicitFlowEnabled\": false,
    \"protocol\": \"openid-connect\",
    \"redirectUris\": [\"http://localhost:3000/*\", \"http://localhost:8000/*\"],
    \"webOrigins\": [\"http://localhost:3000\", \"http://localhost:8000\"],
    \"attributes\": { \"pkce.code.challenge.method\": \"S256\" }
  }")
  [ "$STATUS" = "201" ] && info "Client '${WEB_CLIENT_ID}' criado" || fail "Falha ao criar client (HTTP ${STATUS})"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# 4. Realm Roles (owner, admin, user, support)
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🔧 Configurando realm roles..."

for ROLE in owner admin user support; do
  if kc_get "${KC_URL}/admin/realms/${REALM}/roles/${ROLE}" > /dev/null 2>&1; then
    warn "Role '${ROLE}' já existe"
  else
    STATUS=$(kc_post "${KC_URL}/admin/realms/${REALM}/roles" "{\"name\": \"${ROLE}\"}")
    [ "$STATUS" = "201" ] && info "Role '${ROLE}' criada" || warn "Role '${ROLE}' — HTTP ${STATUS}"
  fi
done

# ═══════════════════════════════════════════════════════════════════════════════
# 5. Service Account — atribuir realm-admin ao crivo-api
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🔧 Configurando permissões do service account..."

# Busca UUID do client crivo-api
API_UUID=$(kc_get "${KC_URL}/admin/realms/${REALM}/clients?clientId=${API_CLIENT_ID}" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")

# Busca service account user
SA_USER_ID=$(kc_get "${KC_URL}/admin/realms/${REALM}/clients/${API_UUID}/service-account-user" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")

# Busca UUID do client realm-management
REALM_MGMT_UUID=$(kc_get "${KC_URL}/admin/realms/${REALM}/clients?clientId=realm-management" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")

# Busca role realm-admin
REALM_ADMIN_ROLE=$(kc_get "${KC_URL}/admin/realms/${REALM}/clients/${REALM_MGMT_UUID}/roles/realm-admin")

# Atribui realm-admin ao service account
STATUS=$(curl -sf -o /dev/null -w "%{http_code}" -X POST \
  "${KC_URL}/admin/realms/${REALM}/users/${SA_USER_ID}/role-mappings/clients/${REALM_MGMT_UUID}" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d "[${REALM_ADMIN_ROLE}]")

if [ "$STATUS" = "204" ] || [ "$STATUS" = "409" ]; then
  info "Service account tem permissão realm-admin"
else
  warn "Atribuição realm-admin — HTTP ${STATUS}"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# 6. Usuário de teste
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "🔧 Configurando usuário de teste..."

EXISTING_USER=$(kc_get "${KC_URL}/admin/realms/${REALM}/users?email=${TEST_USER_EMAIL}&exact=true" 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(d[0]['id'] if d else '')" 2>/dev/null || echo "")

if [ -n "$EXISTING_USER" ]; then
  warn "Usuário '${TEST_USER_EMAIL}' já existe"
else
  STATUS=$(kc_post "${KC_URL}/admin/realms/${REALM}/users" "{
    \"username\": \"${TEST_USER_EMAIL}\",
    \"email\": \"${TEST_USER_EMAIL}\",
    \"firstName\": \"Jane\",
    \"lastName\": \"Doe\",
    \"enabled\": true,
    \"emailVerified\": true,
    \"credentials\": [{\"type\": \"password\", \"value\": \"${TEST_USER_PASSWORD}\", \"temporary\": false}]
  }")
  [ "$STATUS" = "201" ] && info "Usuário '${TEST_USER_EMAIL}' criado (senha: ${TEST_USER_PASSWORD})" || warn "Usuário — HTTP ${STATUS}"
fi

# ═══════════════════════════════════════════════════════════════════════════════
# Resultado
# ═══════════════════════════════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "🎉 Keycloak configurado com sucesso!"
echo ""
echo "  Realm:        ${REALM}"
echo "  Admin:        http://localhost:8080/admin"
echo "  Clients:      ${API_CLIENT_ID} (confidential), ${WEB_CLIENT_ID} (public)"
echo "  Roles:        owner, admin, user, support"
echo "  Test user:    ${TEST_USER_EMAIL} / ${TEST_USER_PASSWORD}"
echo ""
echo "  OIDC Config:  http://localhost:8080/realms/${REALM}/.well-known/openid-configuration"
echo "═══════════════════════════════════════════════════════════════"
