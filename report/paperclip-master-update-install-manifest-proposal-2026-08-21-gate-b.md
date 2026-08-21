# Paperclip master update install manifest proposal — Gate B

Date: 2026-08-21 (Asia/Makassar)

Status: proposal only. None of these live steps has been run.

## Bound inputs

- Approved source base: `a0ed84d24d1e75c6c199bba9a31c9c3f66c31fca`.
- Approved master input: `733ffbf7c3e24942138d1d610494d7b22945918c`.
- Candidate: final report-bearing SHA supplied with the Gate B request.
- Live repository: `/Users/dmydry/projects/paperclip`.
- Candidate worktree: `/Users/dmydry/projects/paperclip-candidate-20260821`.
- Database sequence: upstream `0197…0226`, then content-preserved custom `0227`.
- No live agent model/config/instruction/skill PATCH is part of this core release.

## Phase 3 preflight

Run only after the owner approves one exact final candidate SHA and reports that agent runs are idle:

```bash
set -euo pipefail
REPO=/Users/dmydry/projects/paperclip
APPROVED_CANDIDATE_SHA=<OWNER_APPROVED_FULL_SHA>
EXPECTED_DEV=a0ed84d24d1e75c6c199bba9a31c9c3f66c31fca
EXPECTED_MASTER=733ffbf7c3e24942138d1d610494d7b22945918c

git -C "$REPO" fetch --prune origin
test "$(git -C "$REPO" rev-parse origin/dev)" = "$EXPECTED_DEV"
test "$(git -C "$REPO" rev-parse origin/master)" = "$EXPECTED_MASTER"
test -z "$(git -C "$REPO" status --short)"
git -C "$REPO" merge-base --is-ancestor "$EXPECTED_DEV" "$APPROVED_CANDIDATE_SHA"
git -C "$REPO" merge-base --is-ancestor "$EXPECTED_MASTER" "$APPROVED_CANDIDATE_SHA"
systemctl is-active --quiet paperclip.service
curl -fsS http://127.0.0.1:3100/api/health >/dev/null
```

Before the first write, re-read active Paperclip runs and pending adapter-auth/setup sessions. Fail closed if any are active or if the candidate/source/service state differs.

## Exact release apply

1. Stop only `sinisana-pr-review-preflight-active.timer` and record whether it was active, so it can be restored to the same state.
2. Create and verify a fresh Paperclip database backup. Record path, UTC time, byte size and SHA-256.
3. Create a mode-0600 operator snapshot of the current Paperclip config, env and systemd unit without printing their contents.
4. Fast-forward live `dev` to the approved candidate and push `dev`.
5. Install, build and prepare both UI dist trees while the old service is still serving.
6. Stop Paperclip, apply migrations once, and start Paperclip.

```bash
cd "$REPO"
pnpm paperclipai db:backup --json

git merge --ff-only "$APPROVED_CANDIDATE_SHA"
git push origin dev
pnpm install --frozen-lockfile
pnpm run build
pnpm --filter @paperclipai/server prepare:ui-dist

sudo -n systemctl stop paperclip.service
PAPERCLIP_CONFIG=/home/dmydry/.paperclip/instances/default/config.json pnpm db:migrate
sudo -n systemctl reset-failed paperclip.service
sudo -n systemctl start paperclip.service
```

No database restore, hard reset, downgrade, agent config PATCH or live instruction sync is an automatic failure action. Stop and report at the exact failed boundary.

## Post-release proof

Required before restoring the PR-review timer:

- live worktree, `origin/dev` and service health all resolve to the approved release SHA;
- migration inspector reports `upToDate` and no migration remains pending;
- `paperclip.service` is active without restart loop or new startup/recovery errors;
- localhost and tailnet health pass;
- `ui/dist` and `server/ui-dist` identify the same current bundle;
- root, asset, `/issues` and a current deep link load in Chromium;
- no unexpected agent run or hire approval was created;
- `codex_subscription_2_local` remains registered, and OpenCode core remains registered without recreating Paper-01 OpenCode usage;
- pre-release SIN/BAL model-routing manifest is unchanged;
- the PR-review timer is returned to its pre-release active state and a later successful tick is observed.

## Rollback boundary

Before migration, source can be returned by fast-forwarding a separately approved revert. After migration, source-only rollback is unsafe: restore requires the recorded pre-release database backup together with the pre-release source/operator snapshot and a separate owner decision.
