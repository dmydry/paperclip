#!/usr/bin/env bash
set -euo pipefail

readonly ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly HELPER="$ROOT/skills/paperclip/scripts/paperclip-release-blocked.sh"
readonly SCRATCH="$(mktemp -d "${TMPDIR:-/tmp}/paperclip-release-test.XXXXXX")"
trap 'rm -f -- "$SCRATCH/fake-bin/curl" "$SCRATCH/state" "$SCRATCH/comment.md" "$SCRATCH/out.json" "$SCRATCH/error.log"; rmdir -- "$SCRATCH/fake-bin" "$SCRATCH" 2>/dev/null || true' EXIT

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

mkdir -p "$SCRATCH/fake-bin"
printf 'QA gate is ready.\n' > "$SCRATCH/comment.md"
: > "$SCRATCH/state"

cat > "$SCRATCH/fake-bin/curl" <<'FAKE_CURL'
#!/usr/bin/env bash
set -euo pipefail

method='GET'
output=''
payload=''
url=''
while [[ $# -gt 0 ]]; do
  case "$1" in
    --request) method="$2"; shift 2 ;;
    --output) output="$2"; shift 2 ;;
    --write-out) shift 2 ;;
    --data-binary) payload="${2#@}"; shift 2 ;;
    --header|--connect-timeout|--max-time|--noproxy) shift 2 ;;
    -q|-sS) shift ;;
    *) url="$1"; shift ;;
  esac
done

count="$(wc -l < "$FAKE_CURL_STATE" | tr -d ' ')"
printf '%s %s\n' "$method" "$url" >> "$FAKE_CURL_STATE"

if [[ "$method" == 'GET' ]]; then
  if [[ "$FAKE_CURL_MODE" == 'already' ]]; then
    printf '%s\n' '{"id":"target-id","identifier":"BAL-2","status":"todo","blockedBy":[]}' > "$output"
  else
    printf '%s\n' '{"id":"target-id","identifier":"BAL-2","status":"blocked","blockedBy":[{"id":"blocker-id","identifier":"BAL-1","status":"done"}]}' > "$output"
  fi
  printf '200'
  exit 0
fi

if [[ "$FAKE_CURL_MODE" == 'conflict' ]]; then
  printf '%s\n' '{"error":"explicit resume denied","details":{"code":"resume_blocked"}}' > "$output"
  printf '409'
  exit 0
fi

if [[ "$count" == '1' ]]; then
  jq -e '.blockedByIssueIds == [] and (has("status") | not)' "$payload" >/dev/null
  printf '%s\n' '{"id":"target-id","identifier":"BAL-2","status":"blocked","blockedByIssueIds":[],"blockedBy":[],"updatedAt":"2026-08-25T00:00:00Z"}' > "$output"
else
  jq -e '.status == "todo" and .comment == "QA gate is ready.\n"' "$payload" >/dev/null
  printf '%s\n' '{"id":"target-id","identifier":"BAL-2","status":"todo","blockedByIssueIds":[],"blockedBy":[],"updatedAt":"2026-08-25T00:00:01Z","comment":{"id":"comment-id","createdAt":"2026-08-25T00:00:01Z","body":"QA gate is ready.\n"}}' > "$output"
fi
printf '200'
FAKE_CURL
chmod +x "$SCRATCH/fake-bin/curl"

run_helper() {
  PATH="$SCRATCH/fake-bin:$PATH" \
  FAKE_CURL_STATE="$SCRATCH/state" \
  FAKE_CURL_MODE="$1" \
  PAPERCLIP_API_URL='https://paperclip.example/api' \
  PAPERCLIP_API_KEY='secret' \
  PAPERCLIP_RUN_ID='run-id' \
  PAPERCLIP_AGENT_ID='agent-id' \
    "$HELPER" \
      --issue-id BAL-2 \
      --expected-blocker BAL-1 \
      --comment-file "$SCRATCH/comment.md"
}

run_helper success > "$SCRATCH/out.json"
jq -e '.result == "released" and .status == "todo"' "$SCRATCH/out.json" >/dev/null \
  || fail 'successful two-step release did not return the expected receipt'
[[ "$(wc -l < "$SCRATCH/state" | tr -d ' ')" == '3' ]] \
  || fail 'successful release did not make exactly three requests'

: > "$SCRATCH/state"
run_helper already > "$SCRATCH/out.json"
jq -e '.result == "already_released" and .status == "todo"' "$SCRATCH/out.json" >/dev/null \
  || fail 'already-released issue was not an idempotent no-op'
[[ "$(wc -l < "$SCRATCH/state" | tr -d ' ')" == '1' ]] \
  || fail 'already-released issue made more than one request'

: > "$SCRATCH/state"
set +e
run_helper conflict > "$SCRATCH/out.json" 2> "$SCRATCH/error.log"
status=$?
set -e
[[ "$status" == '76' ]] || fail "deterministic 409 returned $status instead of 76"
[[ "$(wc -l < "$SCRATCH/state" | tr -d ' ')" == '2' ]] \
  || fail 'deterministic 409 was retried or advanced to the second write'
rg -q 'HTTP 409; no retry was attempted' "$SCRATCH/error.log" \
  || fail 'deterministic 409 diagnostic is missing'

printf 'PASS: Paperclip blocked-release helper\n'
