# Paperclip master -> dev update review, 2026-05-24

## Scope

- Live branch before review: `dev` at `3672789c Allow cross-agent plain issue comments`
- Incoming source: `origin/master` at `96f0279e Make ACPX-Claude adapter work seamlessly (PAPA-388) (#6590)`
- Candidate branch: `merge/master-into-dev-20260524`
- Candidate merge commit: `f81ad795 Merge master into dev for 2026-05-24 update review`
- Incoming range: `origin/dev..origin/master`
- Incoming volume: 86 non-merge commits, 821 files changed, about 101k insertions and 6.5k deletions

## High-value incoming changes

### Product / operator workflow

- Blocked Inbox attention view (`4142559c`) adds a dedicated triage surface for blocked work, blocked-reason chips, urgency ordering, and backend blocker attention contracts.
- Source-scoped recovery actions (`0808b388`) move recovery from ad hoc child issue patterns into first-class source-issue state with owner, evidence, outcome, and UI indicators.
- Ordered sub-issue navigation (`012a7387`) makes large nested plans easier to traverse without returning to board/list views.
- Scaled Kanban board (`afb73ba5`) adds compact cards, collapsed cold lanes, reveal limits, and density controls for high-volume columns.
- Issue document locking (`03ad5c5b`) gives review/approval workflows safer handoff points for approved documents and derived edits.
- Company search, i18n foundation, markdown/thread polish, sidebar polish, invite fixes, and mobile flow polish improve day-to-day board usability.

### Runtime / adapters

- New built-in adapters: `cursor_cloud` (`534aee66`) and `grok_local` (`ab8b4716`), plus ACPX-Claude work (`96f0279e`) and ACPX runtime polish.
- Codex/Gemini/OpenCode/Pi/Cursor adapter hardening: auth home handling, stream parsing, sandbox install commands, workspace resume/restore, remote probes, callback bridge, and environment isolation.
- Remote sandbox provider expansion: Cloudflare, Daytona, exe.dev, Modal, E2B reliability fixes, and plugin-managed sandbox provider plumbing.
- Cloud Upstream sync (`e43b392a`) adds local upstream import/export/control-plane sync surfaces and startup reconciliation.

### Security / access / secrets

- Provider vault secrets UX (`d67347be`) and secrets provider infrastructure add company secret bindings, provider configs, access events, remote import, and AWS Secrets Manager support.
- Agent permission/access-control changes introduce more explicit permission grants and compatibility backfills.
- Plugin runtime invocation scope hardening (`a1835cfa`) and host service authorization tests reduce plugin blast radius.
- Sandbox callback bridge and remote execution changes reduce host env leakage and constrain what remote/sandbox jobs can call back into.

### Plugins / extensibility

- LLM Wiki plugin package and migrations land in the monorepo.
- Workspace diff viewer plugin adds a plugin-based workspace diff surface.
- Plugin SDK gets richer worker/UI APIs, managed resources, plugin local folders, local plugin dev workflow, and testing utilities.
- CI/release packaging fixes add canary publishing and Docker/package coverage for new plugin/adapters.

### UI

- Blocked Inbox, Secrets page, provider vault UI, issue recovery action cards, source-resolved fold callouts, sidebar section controls, compact Kanban, routine history polish, issue sibling navigation, and mobile board flow polish.
- Invite page blank-screen fix and wrapped company issue prefix fix are directly relevant to operator access/recovery.

## Relevance for Paper-01 workflow

### Start using after release

- Use Blocked Inbox as the first triage view for blocked/parked work instead of scanning only standard Inbox.
- Use source-scoped recovery actions as the canonical recovery status, rather than relying only on comments or child recovery tasks.
- Use document locking for approved plans/specs/release artifacts where agent edits should be routed to derived docs.
- Use ordered sibling/sub-issue navigation when reviewing generated task trees.
- Keep zip attachments and QA FAIL return-to-todo behavior from our local workflow; both are preserved in the candidate.

### Evaluate before adopting broadly

- `cursor_cloud`, `grok_local`, ACPX, Cloudflare/Daytona/exe.dev/Modal sandbox providers: opt-in only. Do not assign live production agents to them until adapter smoke and credential boundaries are reviewed.
- Cloud Upstream sync: high product value for portability/import, but stores connection/token/private-key material and needs separate security review before live use.
- Provider vault secrets / AWS remote import: valuable for replacing inline secrets, but should be rolled out by provider/company, with read-only inventory first.
- i18n catalog: useful foundation, but not a priority for Paper-01 ops until user-facing locale switching is desired.

## Conflicts and resolutions

- `cli/src/__tests__/network-bind.test.ts`: preserved our Paper-01 host-independent Tailscale test isolation by hiding the binary through a temp `PATH`; retained upstream path restoration.
- `cli/src/__tests__/onboard.test.ts`: combined upstream `cwd` restoration with our temp-bin Tailscale hiding and env reset cleanup.
- `server/src/__tests__/heartbeat-stale-queue-invalidation.test.ts`: took upstream centralized `TRUNCATE ... CASCADE` cleanup helper with retry, replacing the older manual delete sequence.
- `server/src/index.ts`: accepted upstream `prepareEmbeddedPostgresNativeRuntime()` and `reconcileCloudUpstreamRunsOnStartup()` startup hooks.
- `server/src/routes/issues.ts`: combined upstream cheap status-only recovery guards and scheduled-retry cancellation with our local cross-agent plain comments and QA FAIL return-to-todo behavior.
- `server/src/__tests__/issue-comment-reopen-routes.test.ts`: added coverage proving non-assignee agent `## QA FAIL` comments can return closed work to `todo` with `source: qa_fail_comment`.
- `ui/src/components/KanbanBoard.tsx`: combined upstream compact overlay cards with our `userName` prop preservation.

## Local customizations preserved

- Cross-agent plain issue comments remain allowed for same-company agents; explicit resume/reopen/interrupt intents still go through dedicated guards.
- QA FAIL comments by a non-assignee agent still return `done`/`in_review` issues to `todo`.
- Paper-01 Tailscale-present host no longer breaks no-Tailscale CLI/onboard tests.
- Previous `server/ui-dist` release checklist guard remains in the update skill and live release procedure.

## Candidate verification fixes

- Stabilized `NewIssueDialog` inherited-subissue defaults test by waiting for submit enablement after async defaults settle.
- Increased embedded-Postgres-heavy test timeouts in `cli/src/__tests__/routines.test.ts`, `cli/src/__tests__/worktree.test.ts`, and `packages/db/src/client.test.ts`. The assertions were unchanged; the new `0082..0089` migration set makes local seed/replay slower on Paper-01.

## Risk areas

- DB migrations `0082..0089`: secrets/provider configs, recovery actions, document locks, routine env contract, broad permission backfills, cloud upstream sync. See migration review.
- Permission backfills (`0087`, `0088`) expand grants for users and agents. Must verify Owner/Admin permissions after release.
- Cloud Upstream stores private key and token material in DB columns. Treat as sensitive and do not enable sync until reviewed.
- New adapters/sandbox providers increase package/build/test surface and can affect full build time.
- Plugin runtime and secrets changes alter boundary surfaces; smoke plugin manager/secrets pages even if we do not use them immediately.

## Verification

Completed:

- `pnpm install --frozen-lockfile`
- `pnpm run typecheck`
- Targeted conflict tests:
  - `cli/src/__tests__/network-bind.test.ts`
  - `cli/src/__tests__/onboard.test.ts`
  - `server/src/__tests__/heartbeat-stale-queue-invalidation.test.ts`
  - `server/src/__tests__/issue-comment-reopen-routes.test.ts`
  - `server/src/__tests__/issues-comment-reopen.test.ts`
  - `ui/src/components/KanbanBoard.test.tsx`
- `git diff --check`
- `pnpm run test:run:general`
- Serialized suite in four shards:
  - `node scripts/run-vitest-stable.mjs --mode serialized --shard-index 0 --shard-count 4`
  - `node scripts/run-vitest-stable.mjs --mode serialized --shard-index 1 --shard-count 4`
  - `node scripts/run-vitest-stable.mjs --mode serialized --shard-index 2 --shard-count 4`
  - `node scripts/run-vitest-stable.mjs --mode serialized --shard-index 3 --shard-count 4`
- `pnpm run build`
- `pnpm --filter @paperclipai/server run prepare:ui-dist`
- Disposable instance smoke on temp embedded Postgres:
  - health and first-run migrations
  - company/project/agent creation
  - blocker relation
  - issue plan document
  - request-confirmation interaction accept
  - zip attachment upload
  - non-assignee agent `## QA FAIL` comment returning `done` work to `todo`
  - static UI shell
  - Playwright browser deep link to issue detail, screenshot saved under `/tmp/paperclip-update-smoke-20260524-bpRefb`

## Owner decision before live release

- Approve applying migrations `0082..0089` after DB backup.
- Confirm whether to keep new Cloud Upstream and provider-vault surfaces visible but unused, or hide/disable any experimental flags post-release.
- After candidate verification passes, approve live `dev` fast-forward, push, build, `server/ui-dist` refresh, migrations, service restart, and live smoke.
