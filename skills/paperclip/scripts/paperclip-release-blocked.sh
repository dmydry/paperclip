#!/usr/bin/env bash
set -euo pipefail
set +x
umask 077

usage() {
  cat >&2 <<'EOF'
Usage:
  paperclip-release-blocked.sh --issue-id ISSUE \
    --expected-blocker BLOCKER [--expected-blocker BLOCKER ...] \
    --comment-file PATH

Releases one blocked issue in two validated writes:
  1. clear the exact expected blocker set;
  2. move the issue to todo with the handoff comment.

The helper never retries API requests. ISSUE and BLOCKER may be UUIDs or
human-readable identifiers such as BAL-4865.
EOF
}

die() {
  printf 'error: %s\n' "$1" >&2
  exit "${2:-65}"
}

for command_name in curl jq mktemp; do
  command -v "$command_name" >/dev/null 2>&1 \
    || die "required command not found: $command_name" 69
done

issue_id=''
comment_file=''
expected_blockers=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --issue-id)
      [[ $# -ge 2 ]] || { usage; exit 64; }
      issue_id="$2"
      shift 2
      ;;
    --expected-blocker)
      [[ $# -ge 2 ]] || { usage; exit 64; }
      expected_blockers+=("$2")
      shift 2
      ;;
    --comment-file)
      [[ $# -ge 2 ]] || { usage; exit 64; }
      comment_file="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      die "unknown option: $1" 64
      ;;
  esac
done

[[ -n "$issue_id" ]] || { usage; exit 64; }
(( ${#expected_blockers[@]} > 0 )) || die 'at least one --expected-blocker is required' 64
[[ -f "$comment_file" ]] || die '--comment-file must name an existing file' 66
jq -Rs -e 'test("\\S")' "$comment_file" >/dev/null \
  || die '--comment-file must not be empty or whitespace-only' 64

for value in "$issue_id" "${expected_blockers[@]}"; do
  [[ "$value" =~ ^[A-Za-z0-9][A-Za-z0-9_-]*$ ]] \
    || die "unsupported issue identifier: $value" 64
done

for env_name in PAPERCLIP_API_URL PAPERCLIP_API_KEY PAPERCLIP_RUN_ID PAPERCLIP_AGENT_ID; do
  [[ -n "${!env_name:-}" ]] || die "missing required env: $env_name" 64
done
[[ "$PAPERCLIP_API_URL" =~ ^https?://[^[:space:]]+$ ]] \
  || die 'PAPERCLIP_API_URL must be an http(s) URL without whitespace' 64

api_base="${PAPERCLIP_API_URL%/}"
api_base="${api_base%/api}"

scratch_dir="$(mktemp -d "${TMPDIR:-/tmp}/paperclip-release-blocked.XXXXXX")"
headers_file="$scratch_dir/headers"
issue_file="$scratch_dir/issue.json"
payload_file="$scratch_dir/payload.json"
response_file="$scratch_dir/response.json"
expected_file="$scratch_dir/expected.json"

cleanup() {
  unset PAPERCLIP_API_KEY
  rm -f -- "$headers_file" "$issue_file" "$payload_file" "$response_file" "$expected_file"
  rmdir -- "$scratch_dir" 2>/dev/null || true
}
trap cleanup EXIT

{
  printf 'Authorization: Bearer %s\n' "$PAPERCLIP_API_KEY"
  printf 'X-Paperclip-Run-Id: %s\n' "$PAPERCLIP_RUN_ID"
  printf 'Content-Type: application/json\n'
  printf 'Accept: application/json\n'
} > "$headers_file"
unset PAPERCLIP_API_KEY

printf '%s\n' "${expected_blockers[@]}" | jq -Rsc 'split("\n") | map(select(length > 0)) | unique' > "$expected_file"

request() {
  local method="$1"
  local path="$2"
  local output="$3"
  local payload="${4:-}"
  local curl_status http_status
  local args=(
    -q -sS --connect-timeout 5 --max-time 30 --noproxy '*'
    --request "$method"
    --header "@$headers_file"
    --output "$output"
    --write-out '%{http_code}'
  )
  if [[ -n "$payload" ]]; then
    args+=(--data-binary "@$payload")
  fi

  set +e
  http_status="$(curl "${args[@]}" "$api_base$path")"
  curl_status=$?
  set -e

  if (( curl_status != 0 )); then
    die "Paperclip request failed before a confirmed response (curl=$curl_status); no automatic retry was attempted" 75
  fi
  if [[ ! "$http_status" =~ ^2[0-9][0-9]$ ]]; then
    printf 'Paperclip %s %s returned HTTP %s; no retry was attempted.\n' "$method" "$path" "$http_status" >&2
    if jq -e . "$output" >/dev/null 2>&1; then
      jq -c '{error:(.error // "Paperclip request failed"),code:(.code // (if (.details | type) == "object" then .details.code else null end)),details:(.details // null)}' "$output" >&2
    fi
    exit 76
  fi
  jq -e 'type == "object"' "$output" >/dev/null \
    || die 'Paperclip returned a successful non-object response' 65
}

request GET "/api/issues/$issue_id" "$issue_file"

status="$(jq -r '.status // empty' "$issue_file")"
actual_blocker_count="$(jq '(.blockedBy // []) | length' "$issue_file")"
blockers_match=false
if jq -e --slurpfile expected "$expected_file" '
  (.blockedBy // []) as $actual |
  ($actual | length) == ($expected[0] | length) and
  all($expected[0][]; . as $wanted | any($actual[]; .id == $wanted or .identifier == $wanted))
' "$issue_file" >/dev/null; then
  blockers_match=true
fi

if [[ ( "$status" == 'todo' || "$status" == 'in_progress' ) && "$actual_blocker_count" == 0 ]]; then
  jq '{result:"already_released",id,identifier,status,blockedBy:[]}' "$issue_file"
  exit 0
fi

[[ "$status" == 'blocked' ]] \
  || die "expected blocked issue, got status=$status" 76

if [[ "$actual_blocker_count" != 0 && "$blockers_match" != true ]]; then
  printf 'Expected blocker set does not match live state; no mutation was attempted.\n' >&2
  jq '{identifier,status,blockedBy:((.blockedBy // []) | map({id,identifier,status}))}' "$issue_file" >&2
  exit 76
fi

if [[ "$actual_blocker_count" != 0 ]]; then
  jq -n '{blockedByIssueIds:[]}' > "$payload_file"
  request PATCH "/api/issues/$issue_id" "$response_file" "$payload_file"
  jq -e '
    .status == "blocked" and
    (((.blockedByIssueIds // []) + ((.blockedBy // []) | map(.id))) | unique | length) == 0
  ' "$response_file" >/dev/null \
    || die 'blocker-clear response did not prove blocked state with an empty blocker set' 65
fi

jq -n --rawfile comment "$comment_file" '{status:"todo",comment:$comment}' > "$payload_file"
request PATCH "/api/issues/$issue_id" "$response_file" "$payload_file"
jq -e --rawfile comment "$comment_file" '
  .status == "todo" and
  (((.blockedByIssueIds // []) + ((.blockedBy // []) | map(.id))) | unique | length) == 0 and
  (.comment.body == $comment)
' "$response_file" >/dev/null \
  || die 'release response did not prove todo state, empty blockers, and the exact handoff comment' 65

jq '{result:"released",id,identifier,status,blockedBy:[],updatedAt,comment:{id:.comment.id,createdAt:.comment.createdAt}}' "$response_file"
