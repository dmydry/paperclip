# Paperclip master -> dev update review, 2026-06-01

## Scope

- Source: `origin/master` at `161859f9`.
- Base: current `origin/dev` / live `dev` at `46c91938`.
- Candidate branch: `merge/master-into-dev-20260601`.
- Candidate head: `1798df25`.
- Incoming non-merge commits: 25.
- Diff size: 364 files, about 106k insertions and 4.9k deletions, dominated by migration snapshots and bundled skill/catalog assets.

## Product changes

- Issue Output / artifact playback: agents can upload artifacts, including video issue attachments, and the issue UI has an output surface for playback/review.
- Document annotations: issue documents now support anchored annotation threads, comments, remapping across revisions, and UI panels/layers for document review.
- Accepted-plan decomposition guards: accepted plan decomposition gets exact-once protection and visible UI state so duplicate child task creation is less likely.
- Skills catalog and CLI: bundled skills, catalog manifest/build tooling, skills CLI, skill detail support, and catalog provenance were added.
- Bundled skills: wireframe, QA acceptance, issue triage, task planning, doc maintenance, GitHub PR workflow, agent browser, release announcement, and design critique.
- Resource membership controls: users can join/leave project and agent resources; sidebar/project/agent UI surfaces now respect and expose membership state.
- Private browser first-admin claim: authenticated/private deployments get a first-admin claim flow and related bootstrap setup UX.
- Plugin manager visibility: bundled plugins are shown in the plugin manager.
- Workspace/runtime hardening: workspace finalize gates, no-remote-git enforcement, accepted-plan workspace refresh, and execution workspace policy improvements.
- Recovery reliability: continuation recovery retry streaks are now scoped by failure cause.
- Adapter/tooling updates: Claude model refresh, exe.dev config UX fixes, shared adapter-utils, and process adapter execution changes.

## Relevance for Paper-01 workflow

- High value:
  - Artifact upload/output is directly useful for agent deliverables: screenshots, videos, generated assets, reports.
  - Document annotations make `plan`/spec review less dependent on long comments.
  - Exact-once plan decomposition reduces duplicate child issues after owner acceptance.
  - Skills catalog/CLI can become the supported way to inspect and distribute bundled skills instead of ad hoc filesystem checks.
  - Resource memberships can reduce sidebar noise for large companies/projects once we decide the policy.
  - Workspace finalize gates reduce risk around accidental branch/finalization operations.

- Medium value:
  - Private first-admin claim matters for future authenticated/private deployments, less for current owner-only Paper-01 local trusted service.
  - Plugin manager bundled plugin visibility is useful for discovery but not critical to daily operations yet.
  - exe.dev UX improvements are opt-in until we decide to use remote sandbox providers.

- Low immediate value / docs:
  - README/license/brand updates, release changelogs, CI Chrome runner tweaks.

## Local customization reconciliation

- Preserved Paper-01 test hardening for Tailscale-present hosts in CLI bind/onboard tests.
- Preserved zip attachment compatibility including Windows-style `application/x-zip-compressed`.
- Preserved our QA FAIL return-to-todo behavior and cross-agent plain comment behavior while accepting upstream scheduled-retry and recovery changes.
- Preserved worktree reuse sync behavior while adding upstream base-ref drift/finalize gates.
- Kept document edit affordances while adding upstream annotation UI.
- Added a Paper-01 timing stabilization for `backup-lib.test.ts` restore coverage; runtime backup code was not changed.

## Conflict files

- `cli/src/__tests__/network-bind.test.ts`
- `cli/src/__tests__/onboard.test.ts`
- `server/src/__tests__/heartbeat-stale-queue-invalidation.test.ts`
- `server/src/__tests__/issues-service.test.ts`
- `server/src/__tests__/workspace-runtime.test.ts`
- `server/src/attachment-types.ts`
- `server/src/services/workspace-runtime.ts`
- `ui/src/components/IssueDocumentsSection.tsx`

## Verification

- `pnpm --filter @paperclipai/server typecheck`: passed.
- Conflict-targeted tests:
  - `workspace-runtime`
  - `issues-service`
  - `attachment-types`
  - `IssueDocumentsSection` / document annotations
  - CLI bind/onboard tests
- `pnpm run typecheck`: passed.
- `pnpm run test:run:general`: passed after Paper-01 timing stabilization in DB backup restore test.
- `pnpm run test:run:serialized`: passed as 4 shards.
- `pnpm run build`: passed. Vite emitted CSS parser warnings for `::highlight(...)`; build succeeded.
- `pnpm --filter @paperclipai/server prepare:ui-dist`: passed.
- Disposable smoke: passed on temp embedded Postgres/local trusted instance:
  - health
  - company/project/agent creation
  - blocked inbox
  - issue document lock
  - document annotation create/fetch
  - confirmation interaction accept
  - zip attachment upload
  - QA FAIL reopen to `todo`
  - browser deep link with Playwright

## Release readiness

Candidate is ready for owner approval to live-release. Live `dev` has not been changed yet.

Required release steps after approval:

1. Backup live DB.
2. Fast-forward live `dev` to `merge/master-into-dev-20260601`.
3. Push `dev`.
4. `pnpm install --frozen-lockfile`.
5. `pnpm run build`.
6. `pnpm --filter @paperclipai/server prepare:ui-dist`.
7. Stop service, run migrations `0090..0093`, start service.
8. Smoke local/tailnet health, migration status, UI asset hash, browser route, recent logs, and orphan processes.

