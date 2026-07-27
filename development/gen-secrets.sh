#!/usr/bin/env bash
# Print suggested production secrets (does not write files).
# Usage: ./development/gen-secrets.sh
set -euo pipefail
ROOT="$(CDPATH= cd -- "$(dirname "$0")" && pwd)"
GEN="$ROOT/gen-password.sh"

echo "# Suggested secrets — store in a secrets manager or .env (never commit)"
echo "QUARKUS_DATASOURCE_PASSWORD=$("$GEN" 32)"
echo "YAADBUZZ_S3_SECRET_KEY=$("$GEN" 32)"
echo "YAADBUZZ_JWT_REFRESH_PEPPER=$("$GEN" --url 48)"
echo "YAADBUZZ_MAIL_PASSWORD=$("$GEN" 24)"
echo "# Optional Sentry"
echo "# QUARKUS_LOG_SENTRY_ENABLED=true"
echo "# SENTRY_DSN=https://…@o….ingest.sentry.io/…"
echo "# VITE_SENTRY_DSN=https://…@o….ingest.sentry.io/…"
