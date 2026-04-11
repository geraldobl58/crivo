#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE crivo_keycloak;
    GRANT ALL PRIVILEGES ON DATABASE crivo_keycloak TO $POSTGRES_USER;
EOSQL
