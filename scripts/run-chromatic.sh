#!/usr/bin/env sh

# Load env vars from repo-level .env (if present) and run Chromatic using the project token.
set -e

SCRIPT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
REPO_ROOT="$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${REPO_ROOT}/.env"

if [ -f "${ENV_FILE}" ]; then
  set -a
  # shellcheck disable=SC1090
  . "${ENV_FILE}"
  set +a
else
  echo "Warning: ${ENV_FILE} not found. Falling back to existing environment."
fi

if [ -z "${CHROMATIC_PROJECT_TOKEN:-}" ]; then
  echo "CHROMATIC_PROJECT_TOKEN is not set. Add it to ${ENV_FILE} or export it." >&2
  exit 1
fi

cd "${REPO_ROOT}"
npx chromatic
