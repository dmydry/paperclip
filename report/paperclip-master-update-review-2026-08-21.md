# Paperclip master update review — Phase 0/1

Date: 2026-08-21 (Asia/Makassar)

Status: Phase 1 review complete enough for Gate A. No candidate merge, push, migration, restart, live config sync, or instruction sync has been performed.

## Exact release inputs

- Release base: `origin/dev` = `a0ed84d24d1e75c6c199bba9a31c9c3f66c31fca`
- Upstream input: `origin/master` = `733ffbf7c3e24942138d1d610494d7b22945918c`
- Merge base: `5ec7ce76e580c1e515fe811f566df928eb1e08dd`
- Divergence: 98 commits reachable only from `origin/dev`; 431 only from `origin/master`
- Incoming tree delta: 1,655 files, 1,039,667 insertions, 20,414 deletions
- Local tree delta: 174 files, 8,557 insertions, 512 deletions
- The incoming line count is dominated by Drizzle migration snapshots. It is not one million lines of hand-written application code.
- Local `master` on Paper-01 is stale (`0e1a5828313de7a66021e19aca8faa353cd7367a`) and is not an input. All review calculations use freshly fetched `origin/master`.

Live Paper-01 remained on `dev`. The service was healthy when inspected and reported zero restarts. The live database reported `upToDate` with the custom `0197_heartbeat_run_recent_history_indexes.sql` applied.

## Release size and conflict forecast

An isolated `git merge-tree` forecast reports 28 content conflicts. The risk is concentrated in real local customization seams, not spread evenly across the 1,655 incoming files:

- authorization and issue writes: `server/src/services/authorization.ts`, `server/src/services/issues.ts`, `server/src/routes/issues.ts`;
- recovery and workspaces: `server/src/services/heartbeat.ts`, `server/src/services/recovery/*`, `server/src/services/workspace-runtime.ts`;
- adapters and service boot: `server/src/adapters/registry.ts`, `server/src/index.ts`;
- built-in agents/onboarding: `server/src/services/built-in-agents.ts`, onboarding assets and wizard;
- migration journal: `packages/db/src/migrations/meta/_journal.json`;
- Paperclip runtime skill/API reference and generated skill catalog;
- test sharding plus affected server/UI tests.

This must be reconciled as one isolated candidate. A direct merge in the live checkout is not acceptable, but the task does not need extra review stages beyond the existing Gate A → candidate → Gate B flow.

## Important incoming behavior

### Adopt in this release

1. **Decisions workflow.** First-class propose/decide queues and an auditable Decisions desk are a better owner-decision surface than ad-hoc approval cards for multi-option product/ops choices.
2. **Chat-style tasks as the default UI.** The classic task page becomes optional. Core API workflow remains, but SIN/BAL skills that prescribe UI-specific comment/plan steps need a bounded follow-up audit.
3. **Multi-project workspace sync.** Referenced projects are staged by default and shared-workspace runs are serialized. This is useful for SIN cross-repo work, but must be tested against our accepted-plan project-local child-workspace rule.
4. **Activity/audit consolidation.** Use the new Activity surface to diagnose cross-task writes and authorization receipts.
5. **Human-approved secret proposals and secret catalog.** Agents can propose inert secret bindings without receiving secret values. This matches the desired owner-approval model.
6. **Import/export durability.** Company bundles become the supported host-to-host movement path and resumable imports are included.
7. **Codex improvements.** Upstream resolves GPT-5.6 metadata, adds in-product device login, and improves session/recovery behavior. Existing SIN/BAL Sol/Terra xhigh routing must survive unchanged.

### Preserve our behavior

1. The second Codex subscription adapter (`codex_subscription_2_local`), separate `CODEX_HOME`, blank inherited `OPENAI_API_KEY`, and the existing subscription-switch scripts.
2. Run-scoped issue-comment containment plus the tested ability for a run to comment on its own issue.
3. Accepted-plan decomposition across projects: each child gets the target project's workspace and retries ignore run-scoped attribution fields.
4. Successful-run/standing-sprint recovery loop guards.
5. Built-in agent auto-provisioning remains gated. The release must not recreate unwanted Summarizer/Reflection Coach hire approvals.
6. Agent-authenticated instruction writes remain limited to managed instruction-bundle files.
7. BaliBikeHouse role skill bundles and project ops source remain intact.
8. OpenCode support in Paperclip core remains intact. We are not restoring Paper-01 OpenCode agents or host usage, but we are not deleting upstream adapter support.

### Defer from this release

1. Do not replace the existing source checkout + systemd deployment with the new managed CLI install/update lifecycle during the same release. Evaluate it separately after the release is stable.
2. Do not migrate the two-subscription workflow to the new in-product Codex login flow in this release. First prove the current alias on the new adapter-auth session code.
3. Keep Apps/Connections, status cards, Simplified English interactions, Daytona duplex transport, and other opt-in experiments at their existing/default-off state.
4. Do not install or force the new Tailscale runtime HTTPS broker as part of the core upgrade. Leave `auto` behavior and pilot a single SIN frontend preview later.

## Proposed reconciliation strategy

1. Create one isolated candidate from the exact `origin/dev` SHA above and merge the exact `origin/master` SHA above.
2. Resolve generated/catalog and test-harness conflicts from source, then regenerate; do not hand-merge generated JSON as the authority.
3. Renumber the custom applied migration from `0197_heartbeat_run_recent_history_indexes.sql` to `0227_heartbeat_run_recent_history_indexes.sql` without changing SQL bytes, and append its journal entry after upstream `0226`.
4. Re-implement custom behavior as narrow patches on upstream code, with the existing regression tests adapted to current APIs. Do not select the whole `ours` side for authorization, issues, heartbeat, recovery, or workspace files.
5. Keep `ops/company-configs/balibikehouse/**` as a clean local addition.
6. Keep current Paper-01 deployment mechanics for this release.

## Candidate verification (Phase 2)

Minimum required matrix:

1. Migration numbering/safety checks, followed by a fresh-database migration.
2. Restore a disposable copy of the newest Paper-01 backup; prove the renamed custom migration is recognized by hash and only upstream `0197…0226` remain pending; apply them; rerun and prove idempotence.
3. Targeted tests for authorization/current-issue comments, accepted-plan cross-project retries, built-in provisioning gate, recovery/handoff/standing sprint, workspace runtime, subscription-2 adapter and Codex env isolation, instructions-file boundaries, migration journal, skill sync/catalog, onboarding and task-detail UI.
4. `pnpm test:run:general` and `pnpm test:run:serialized`.
5. `pnpm -r typecheck` and `pnpm build`.
6. Verify `ui/dist` exists and the server serves the newly built assets.
7. Disposable operator smoke: company/issue/comment/interaction/approval, one Codex subscription-1 run, one subscription-2 run, and OpenCode adapter registration without creating an OpenCode agent.
8. Produce the Phase 2 reconciliation report and exact candidate SHA for Gate B.

## Release sequence after the gates

- **Gate A:** approve the two input SHAs, this review, the migration review, and every decision-register row. This authorizes only the isolated candidate.
- **Gate B:** approve one exact tested candidate SHA and the evidence bundle.
- Wait for active agent runs to drain; temporarily pause only timers that can start new agent runs.
- Back up database and operator files; fast-forward `dev` to the candidate; push; install frozen dependencies; build server and `ui/dist`.
- Stop Paperclip, run migrations, start Paperclip, and read back health, running commit, UI assets, database state, timers, agent model routing, and both Codex subscription lanes.
- Sync live agent instructions/project skills only as a separate, explicitly approved post-release action.

## Gate A recommendation

Proceed to one isolated Phase 2 candidate with the decisions in the companion register. Do not release directly from `origin/master`, and do not mutate live `dev` yet.
