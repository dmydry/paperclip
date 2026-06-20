# Paperclip Master Update Reconciliation - 2026-06-20 Stage 2

## Scope

This is the reconciliation summary for the candidate branch:

- Live branch not updated: `dev` at `392472c8`
- Review worktree: `/Users/dmydry/projects/paperclip-merge-master-into-dev-20260620`
- Candidate branch: `merge/master-into-dev-20260620`
- Stage-2 base candidate before this report: `996bd519`
- Upstream merged commit: `origin/master` at `3b9f3640`
- Main merge commit: `72547560`

This report is review-only. No live DB migration, push to `dev`, service restart, or prompt sync has been done for this release candidate.

## Merge Conflict Areas

The merge had conflicts in these practical zones:

- Adapter registry and local adapter runtime config
- Codex local execution and subscription-lane behavior
- OpenCode local runtime config and workspace isolation
- DB migration journal and local migration numbering
- Heartbeat startup recovery, workspace/session reuse, and run lifecycle
- Issue routes/service access control, mention grants, and QA reopen behavior
- Routine scheduler behavior
- UI agent configuration, new-agent form, issue detail/chat, markdown body, and new issue dialog
- Tests covering heartbeat, ownership, comments, routines, adapters, CLI context, and UI popovers/file viewer feedback

## Decisions By Area

### Adapter Registry / Codex

Decision: keep upstream adapter-management changes as the base, then preserve our second Codex subscription lane.

Preserved local behavior:

- `codex_subscription_2_local` remains registered as a separate adapter lane.
- Its default model remains `gpt-5.5`.
- It uses a dedicated managed `CODEX_HOME` under `codex-homes/subscription-2` when not explicitly configured.
- UI forms still treat both `codex_local` and `codex_subscription_2_local` as Codex-compatible for model/thinking/search controls.

Upstream behavior retained:

- Managed Codex home cleanup and runtime config changes.
- Updated Codex model options and runtime config support.
- Safer default behavior around OpenAI key inheritance.

Safety note:

- This is important for Paper-01 because it preserves our two-subscription operating model while taking upstream runtime hardening.

### OpenCode Local

Decision: preserve upstream env-driven gateway/provider support while keeping our isolated-workspace permission guard.

Preserved local behavior:

- OpenCode remains constrained inside isolated workspaces by default through `permission.external_directory=deny`.
- External-directory allowance is only used where the runtime context explicitly needs it.

Upstream behavior retained:

- `PAPERCLIP_OPENCODE_PROVIDERS` provider injection.
- `PAPERCLIP_OPENCODE_SMALL_MODEL` support.
- OpenCode model discovery / provider-model UI flow.

Safety note:

- This is the right combination for Paper-01: new provider flexibility without weakening host workspace containment.

### Heartbeat / Runtime Recovery

Decision: prefer upstream startup sequencing and recovery fixes, then preserve local session-reset and branch-reuse rules that matter for our agent workflow.

Upstream behavior retained:

- Startup orphan-run reaping is awaited before timers begin.
- Model changes reset task session reuse.
- Same-issue force-fresh-session wakes can be deferred into follow-up runs instead of coalescing unsafely.
- Stale execution locks are cleared on finalization/reassignment/checkout paths.
- Low-trust runs are forced toward isolated/sandboxed workspace behavior.
- Workspace finalize gates and dependent wakes are kept.

Preserved local behavior:

- Assigned `todo` comment wakes can force a fresh session for project-linked code tasks.
- Standing/shared-workspace comment wakes can force a fresh session where reusing the old thread is unsafe.
- QA/retest child work can reuse the parent branch when that is the correct code-review flow.
- Git-sensitive local adapter workspace validation remains strict.

Safety note:

- This is one of the highest-risk reconciliation areas. Targeted heartbeat/session tests passed before this report, but serialized suite and disposable smoke are still required before release.

### Issue Access / Comments / QA FAIL

Decision: accept upstream tightened read/comment authorization, but preserve our QA lifecycle signal.

Upstream behavior retained:

- Low-trust and source-trust issue boundaries.
- Mention-scoped grants for reading/commenting on issues.
- Non-mentioned peer agents are denied.
- Mention-granted agents can comment without gaining broad mutation rights.
- Explicit resume/reopen intent remains restricted for non-assignees.

Preserved local behavior:

- An authorized non-assignee QA/review agent can post a `## QA FAIL` comment and move a closed issue back to `todo`.
- Assigned blocked issues can still move back to `todo` through the approved comment/PATCH paths when there are no unresolved first-class blockers.
- QA FAIL is recorded as a distinct reopen source, not just a generic comment.

Changed behavior to accept:

- The older expectation that any peer agent could plain-comment on another agent's checkout is not preserved. Upstream's mention/read-auth model is safer and matches the low-trust direction.

Safety note:

- This is a good security tradeoff for Paper-01. It keeps review workflow while narrowing peer-agent write access.

### Routines / Scheduler

Decision: keep upstream paused-project schedule suppression and fix a scheduler bug found during candidate verification.

Upstream behavior retained:

- Archived companies do not wake agents.
- Scheduled routine ticks are suppressed while a project is paused.
- Routine UI/detail improvements are kept.

Additional candidate fix:

- `Fix routine cron midnight scheduling` (`85c19048`) normalizes `Intl.DateTimeFormat` hour `24` to cron hour `0`.
- Without this, daily UTC midnight schedules like `0 0 * * *` could return `null` for next run calculation.

Safety note:

- This was a real runtime issue uncovered by testing, not just a test harness problem. The targeted routines/formatter tests passed after the fix.

### DB Migrations

Decision: preserve upstream migration sequence and renumber our local heartbeat index migration to avoid journal collision.

Incoming upstream migrations:

- `0094_backfill_archived_company_agent_pauses`
- `0095_issue_comment_tombstones`
- `0096_document_annotation_issue_comment_links`
- `0097_low_trust_source_trust`
- `0098_project_icon`
- `0099_skills_store_foundation`
- `0100_skill_install_count_backfill`
- `0101_plugin_company_id_tenant_isolation`
- `0102_managed_sandbox_dedup_index`
- `0103_agent_error_reason`
- `0104_issue_watchdogs`

Local conflict:

- Our dev branch already used migration number `0094` for heartbeat run recent-history indexes.

Resolution:

- Local migration was renamed to `0105_heartbeat_run_recent_history_indexes.sql`.
- `_journal.json` was updated so migration ordering is unambiguous.

Safety note:

- This avoids a dangerous Drizzle journal conflict. Migration review is still a separate remaining stage before live release.

### UI / Product Surface

Decision: keep upstream UI surfaces and preserve our local operational affordances where they are independent.

Merged UI behavior:

- New artifact/file viewer and attachment preview surfaces are kept.
- Issue detail keeps upstream classic/conference-room thread component selection.
- Our linked approvals block remains visible in issue detail.
- New issue dialog keeps upstream work-mode/watchdog fields.
- New issue dialog also keeps our assignee adapter/model lane overrides.
- Agent config and new-agent forms keep `codex_subscription_2_local`.
- Agent config avoids falling back to a Codex model for non-Codex adapters.
- Markdown rendering keeps upstream workspace-file links and known-prefix issue linking.
- Markdown rendering also keeps our `\\n` normalization for shell-expanded comments.

Test-only stabilizations added after merge:

- Watchdog menu test now opens the Radix popover/portal before choosing `Watchdog`.
- Watchdog menu test waits for experimental settings/trigger state instead of reading immediately.
- File viewer copy test waits for async copied-link feedback.

Safety note:

- These are test harness stabilizations around changed UI libraries/portal behavior. They do not alter runtime product logic.

### CLI Context

Decision: keep upstream CLI/API parity and isolate CLI tests from Paper-01 local context.

Upstream behavior retained:

- Broader CLI parity across companies, agents, issues, projects, routines, plugins, access, tokens, teams, assets, and prompts.
- Company context propagation remains intentional behavior.

Candidate test fix:

- CLI company/project-goal tests now use explicit empty context paths where the scenario requires no company context.

Safety note:

- This prevents test results from depending on Paper-01's local context files while keeping runtime company scoping intact.

### Security / Low-Trust / Source Trust

Decision: take upstream as the base.

Kept:

- Low-trust review containment.
- Source-trust fields and promotion flow.
- Per-company JWT signing keys.
- Company-scoped cloud tenants.
- Plugin table tenant isolation.
- HTTP error log token/password redaction.
- Read-auth enforcement for issue thread/comment endpoints.
- Secret binding sync across agent lifecycle.
- Codex local agents protected from shared host OpenAI key leakage.

Safety note:

- These are high-value for Paper-01, but they increase the need for post-release auth/permission smoke checks. We should verify owner/admin/operator/agent read and write paths after release.

### Sandbox / Environment Providers

Decision: include upstream provider foundations, but treat new remote/sandbox providers as owner-approved opt-in.

Included:

- Kubernetes sandbox provider plugin foundation.
- Novita sandbox provider plugin.
- Managed sandbox dedup index.
- Agent runtime container image definitions.
- Environment probe/driver UI changes.

Not enabled by default:

- Kubernetes provider for Paper-01 live use.
- Novita provider for live use.
- Any broad adapter/provider rollout beyond existing configured agents.

Safety note:

- The code can land, but operational adoption should be separate. Paper-01 should continue to prefer existing local execution until an environment/provider policy is approved.

## Candidate-Only Commits After Merge

- `85c19048` - Fix routine cron midnight scheduling.
- `b7bfb607` - Update watchdog menu test for popover portal.
- `9468efb2` - Wait for file viewer copy feedback in tests.
- `a60f1525` - Stabilize watchdog menu test wait.
- `6046b730` - Isolate CLI company context tests.
- `996bd519` - Add stage 1 master update review.

## Local Customizations Preserved

- Second Codex subscription adapter lane.
- Codex subscription lane default model `gpt-5.5`.
- OpenCode isolated-workspace external-directory deny guard.
- Codex/OpenAI key inheritance protection.
- QA FAIL review workflow that can reopen closed work to `todo`.
- Fresh-session rules for comment wakes where old sessions are unsafe.
- QA/retest parent-branch reuse path.
- Linked approvals visibility in issue detail.
- Markdown newline normalization for old comments.
- Heartbeat recent-history index migration, renumbered to `0105`.

## Local Behavior Intentionally Replaced Or Narrowed

- Broad peer-agent comment behavior is narrowed to upstream mention-scoped/read-authorized access.
- Startup orphan-run handling follows upstream awaited sequencing instead of older fire-and-forget behavior.
- Scheduler paused-project behavior follows upstream suppression semantics.
- New adapter/provider surfaces are included but not treated as default Paper-01 operating mode.

## Verification Already Completed Before Stage 2

Completed before this report:

- Targeted cron/routines tests after the cron midnight fix.
- Targeted adapter/OpenCode/Codex/UI tests during conflict resolution.
- Server general pass.
- UI/CLI `general-workspaces-a` pass.
- Shared/db/adapters/plugins `general-workspaces-b` pass.

Still not completed:

- `test:run:serialized` shard 1/4 through 4/4.
- `pnpm run build`.
- `pnpm --filter @paperclipai/server prepare:ui-dist`.
- Disposable smoke.
- Final migration review artifact for this update.
- Final safe/not-safe release verdict.

## Release Safety Assessment At Stage 2

Candidate reconciliation looks coherent, and the conflict decisions preserve the Paper-01-specific behavior that matters.

However, live update is not yet approved-safe because long verification is incomplete. The next safe checkpoint is serialized suite shards, followed by build and disposable smoke.

