#!/usr/bin/env bash
# Generate a cryptographically strong random password for production secrets.
# Usage:
#   ./development/gen-password.sh           # 32 chars (default)
#   ./development/gen-password.sh 48        # custom length
#   ./development/gen-password.sh --url 32  # URL-safe alphabet
set -euo pipefail

URL_SAFE=0
LENGTH=32

while [[ $# -gt 0 ]]; do
  case "$1" in
    --url|-u) URL_SAFE=1; shift ;;
    -h|--help)
      sed -n '2,7p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *)
      if [[ "$1" =~ ^[0-9]+$ ]]; then
        LENGTH="$1"
      else
        echo "Unknown argument: $1" >&2
        exit 1
      fi
      shift
      ;;
  esac
done

if [[ "$LENGTH" -lt 12 ]]; then
  echo "Length must be at least 12" >&2
  exit 1
fi

if [[ "$URL_SAFE" -eq 1 ]]; then
  # URL-safe: A-Za-z0-9-_
  openssl rand -base64 $((LENGTH * 2)) | tr -d '/+=' | tr '+/' '-_' | head -c "$LENGTH"
else
  # Mixed alphabet including symbols suitable for DB / MinIO / JWT secrets
  openssl rand -base64 $((LENGTH * 2)) | tr -d '\n' | tr '/+' 'A_' | head -c "$LENGTH"
fi
echo
