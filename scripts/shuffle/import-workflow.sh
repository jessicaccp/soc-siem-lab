#!/usr/bin/env bash
# Registers the SOAR workflow and its webhook in a local Shuffle instance (T20).
# Reads the API key from configs/shuffle/.env and posts the exported JSON.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SHUFFLE_DIR="$ROOT/configs/shuffle"
WORKFLOW="${1:-$SHUFFLE_DIR/workflows/brute-force-response.json}"

# shellcheck disable=SC1091
set -a; . "$SHUFFLE_DIR/.env"; set +a
API="http://localhost:${BACKEND_PORT}"
FRONTEND="http://localhost:${FRONTEND_PORT}"
AUTH="Authorization: Bearer $SHUFFLE_DEFAULT_APIKEY"

# Nome e id saem do próprio arquivo exportado.
read -r NAME WF_ID <<<"$(python3 - "$WORKFLOW" <<'PY'
import json, sys
wf = json.load(open(sys.argv[1]))
print(wf["name"], wf["id"])
PY
)"

# POST cria um workflow novo com id novo; PUT atualiza o que já existe.
if [ "$(curl -sS -o /dev/null -w '%{http_code}' -H "$AUTH" "$API/api/v1/workflows/$WF_ID")" = "200" ]; then
  curl -sS -X PUT "$API/api/v1/workflows/$WF_ID" -H "$AUTH" \
    -H 'Content-Type: application/json' --data-binary "@$WORKFLOW" >/dev/null
else
  WF_ID="$(curl -sS -X POST "$API/api/v1/workflows" -H "$AUTH" \
    -H 'Content-Type: application/json' --data-binary "@$WORKFLOW" |
    python3 -c 'import json, sys; print(json.load(sys.stdin)["id"])')"
fi

# O backend pode regravar o id do trigger ao salvar; o webhook usa o id que ficou no workflow.
read -r START TRIGGER <<<"$(curl -sS -H "$AUTH" "$API/api/v1/workflows/$WF_ID" |
  python3 -c 'import json, sys; wf = json.load(sys.stdin); print(wf["start"], wf["triggers"][0]["id"])')"

curl -sS -X POST "$API/api/v1/hooks/new" -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"type\":\"webhook\",\"id\":\"$TRIGGER\",\"name\":\"Webhook\",\"description\":\"Entrada do alerta do Wazuh\",\"workflow\":\"$WF_ID\",\"start\":\"$START\",\"environment\":\"onprem\"}"

echo
echo "workflow: $NAME ($WF_ID)"
echo "webhook:  $FRONTEND/api/v1/hooks/webhook_$TRIGGER"
