# Paperclip master update review - 2026-05-08

## Scope

- Source branch: `master` / `origin/master` at `0e1a5828`.
- Target baseline: `origin/dev` at `78518321`.
- Review branch/worktree: `merge/master-into-dev-20260508` in `/Users/dmydry/projects/paperclip-merge-master-into-dev-20260508`.
- Candidate merge commit: `b5d5f943`.
- Live service checkout was not changed: `/Users/dmydry/projects/paperclip` remains on `dev`.

## Incoming update size

- `master` brings 144 commits over the merge base.
- Local `dev` has 39 dev-only commits, 31 non-merge commits.
- Incoming diff touches 944 files, with large DB migration snapshots and broad server/UI/runtime changes.

## High-value incoming changes

### Product and operator workflow

- Issue controls: retry-now recovery, issue controls, stale notices, workspace changes in issue threads.
- Planning mode for issue work.
- Full company search page.
- Sidebar/operator QoL: search icon route, sidebar/workspace switcher updates, task controls, nested issue UI polish.
- Routine revision history and restore flow.
- Issue thread interactions, issue blockers, issue tree controls, scheduled retry cards, successful-run handoff UI.

### Runtime, adapters, and execution environments

- ACPX local adapter runtime.
- E2B sandbox provider plugin and generalized sandbox provider runtime.
- Remote execution target abstractions for SSH/E2B/local-aware sandboxes.
- Remote workspace sync/restore hardening.
- Sandbox callback bridge and heartbeat allowlist expansion.
- Explicit runtime command spec per adapter.
- Codex CLI 0.122+ API-key auth support.
- Gemini stream-json parser compatibility.
- Cursor sandbox runtime resolution stabilization.

### Control plane and recovery reliability

- Liveness auto-recovery controls.
- Retry max-turn-exhausted heartbeats.
- Active-run output watchdog.
- Successful-run handoff recovery.
- Productivity review recovery bounds.
- Assigned backlog liveness guard.
- Issue identifier and cross-tenant route hardening.

### Plugins and platform surface

- Expanded plugin host surface.
- Plugin-managed agents/routines/resources.
- Plugin local folders and plugin environment driver.
- Plugin SDK protocol/testing/UI additions.
- Fake sandbox plugin and E2B provider packages.

### Database and migrations

- New migrations `0060` through `0081`.
- New schemas for environments, leases, issue references, issue thread interactions, issue tree holds, plugin-managed resources, active-run watchdog decisions.
- Company search indexes and fuzzy search extension migration.
- Backup support expanded for non-system schemas.

### Security-sensitive changes

- Host process env stripping for SSH, Pi, OpenCode, and remote execution probes.
- Secret reference validation for JSON schema config.
- Board access gating around stale-run watchdog decisions.
- Auth/public URL and trusted-origin handling updates.
- Security role route coverage.
- Default hire approval behavior changed by migration `0071_default_hire_approval_off.sql`; review this before production migration.

## Relevance for our Paper-01 workflow

### Critical

- Heartbeat/recovery/runtime changes: directly affect agent execution reliability.
- Remote env and sandbox hardening: directly affects Paper-01 and external execution safety.
- DB migrations: must be reviewed before applying to the live database.
- Issue thread/comment/mention behavior: central to our agent workflow.
- Auth/public URL/runtime API changes: must preserve Paper-01 tailnet/authenticated access.

### High

- Issue UI list/thread changes, issue controls, retry-now, stale notices.
- Plugin host and environment driver changes if we rely on plugins/sandbox providers.
- Company search and issue references if we use cross-issue context.

### Medium

- Planning mode, routine revision history, sidebar UX polish.
- ACPX adapter if we intend to use it.
- Storybook and visual assets.

### Low

- AWS ECS deployment docs/assets for current Paper-01 flow.
- Release packaging docs unless we publish packages from this instance.

## Local custom conflicts and chosen resolution

### `server/src/index.ts`

- Upstream introduced `PAPERCLIP_RUNTIME_API_URL`, runtime API candidates, explicit listen-port tracking, and plugin worker manager wiring.
- Local dev had a direct `PAPERCLIP_API_URL=http://...` runtime host fix from authenticated/deep-link work.
- Resolution: use upstream runtime API model and plugin worker manager wiring. Preserve local access-route behavior through already-merged `routes/access.ts` changes.

### `server/src/routes/issues.ts`

- Upstream introduced explicit resume/follow-up intent, blocker checks, issue references, and interaction wake context.
- Local dev had QA-fail comment auto-return-to-todo behavior.
- Resolution: combine both. Keep upstream explicit resume/blocker/reference flow and preserve `qa_fail_comment` auto-return source when another agent posts a QA FAIL comment.

### `server/src/services/issues.ts`

- Upstream extracted unowned checkout adoption into `adoptUnownedCheckoutRun`.
- Local dev had equivalent inline adoption logic.
- Resolution: use upstream helper. It gives the same behavior with cleaner shared code.

### `server/src/services/heartbeat.ts` and `server/src/services/recovery/service.ts`

- Upstream moved recovery logic into dedicated recovery services and added issue-tree interaction/blocker support.
- Local dev had comment-driven fresh-session resets and sprint standing container skip logic.
- Resolution: keep local fresh-session helpers in heartbeat, keep upstream interaction/blocker support, and move sprint standing skip into `recovery/service.ts`, where stranded recovery now lives.

### `ui/src/components/IssueDocumentsSection.tsx`

- Upstream added foldable markdown body rendering.
- Local dev added body hydration and editable document body behavior needed for zip/document handling.
- Resolution: combine them. Hydration and click-to-edit remain; display uses upstream foldable rendering.

### `ui/src/components/NewIssueDialog.tsx`

- Upstream added `issue-assignee-overrides`.
- Local dev added zip file accept types.
- Resolution: use upstream override helper/import and keep zip MIME/extensions in `STAGED_FILE_ACCEPT`.

### `ui/src/components/IssuesList.tsx` and `ui/src/pages/Issues.tsx`

- Upstream added server pagination/infinite scrolling and workspace filtering.
- Local dev added "show full grouped issue lists".
- Resolution: keep upstream pagination/workspace filtering, keep 1000 default page size, and only cap rendered rows for plain ungrouped list mode. Grouped views render all loaded rows.

### `skills/paperclip/SKILL.md`

- Upstream added dependency-blocked interaction guidance.
- Local dev had mandatory inbox fallback, no-wide-discovery rule, and token-discipline guidance.
- Resolution: combine both.

## Verification run

Passed:

- `pnpm install --frozen-lockfile`
- `pnpm --filter @paperclipai/server typecheck`
- `pnpm --filter @paperclipai/ui typecheck`
- `pnpm exec vitest run server/src/__tests__/heartbeat-process-recovery.test.ts`
- `pnpm exec vitest run server/src/__tests__/workspace-runtime.test.ts server/src/__tests__/issue-comment-reopen-routes.test.ts server/src/__tests__/attachment-types.test.ts`
- `pnpm exec vitest run ui/src/components/IssueDocumentsSection.test.tsx ui/src/components/NewIssueDialog.test.tsx ui/src/components/IssuesList.test.tsx`
- `pnpm exec vitest run ui/src/pages/Issues.test.tsx`
- `git diff --cached --check`

Notes:

- First heartbeat recovery run exposed test cleanup order after upstream successful-run handoff changes. Cleanup was fixed by deleting `documentRevisions`/`documents` again before company deletion; rerun passed.
- First UI run exposed a page-size expectation mismatch. Test was updated to reflect the retained 1000 issue page size.

## Remaining risks before updating `dev`

- Full suite not run yet. This update is large enough that full `pnpm test:run` or at least `test:run:general` + `test:run:serialized` should run before deploy.
- DB migrations must be reviewed against the live Paper-01 database before applying. Pay attention to migration `0071_default_hire_approval_off.sql`.
- Need a runtime smoke on a disposable dev server before restarting `paperclip.service`: login/access, issue list grouped and ungrouped, create issue with zip attachment, comment QA FAIL reopen flow, one heartbeat run, one recovery/status path.
- Need owner review before merging into `dev`, pushing, applying migrations, or restarting service.

## Rules to bake into the future skill

1. Never work directly in the live `dev` checkout. Use a separate worktree and branch.
2. Fetch `origin/master` and `origin/dev`; fast-forward local `master` safely if needed.
3. Create a dated review branch from `origin/dev`.
4. Merge `master` into the review branch; do not update `dev` yet.
5. Inventory incoming changes by product, runtime, DB, security, UI, CI/release, and docs.
6. Inventory dev-only commits and map conflicts to local custom behavior.
7. Prefer upstream implementations when they give the same or better behavior.
8. Preserve local behavior only when upstream does not cover the actual Paper-01 workflow.
9. Treat DB migrations, auth/runtime URL changes, env handling, sandbox/SSH execution, and heartbeat recovery as high-risk.
10. Resolve conflicts in the review branch, commit locally, and run targeted typecheck/tests.
11. Produce a review artifact before owner approval.
12. Only after owner approval: merge/update `dev`, push, build, migrate if required, restart, and smoke test live service.
