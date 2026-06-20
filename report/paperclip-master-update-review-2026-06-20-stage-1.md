# Paperclip master -> dev update review, stage 1

Date: 2026-06-20

Scope: review-only summary of incoming `origin/master` relative to live `origin/dev`.
This stage does not certify the release. It intentionally excludes the remaining
serialized/build/disposable-smoke verdict.

## Current state

- Live branch: `origin/dev` at `392472c8`.
- Incoming master: `origin/master` at `3b9f3640`.
- Candidate worktree: `/Users/dmydry/projects/paperclip-merge-master-into-dev-20260620`.
- Candidate branch: `merge/master-into-dev-20260620`.
- Candidate HEAD: `6046b730`.
- Live Paperclip was not updated during this review stage.
- Incoming range size: 240 non-merge commits, 1096 changed files.
- Large surfaces: `packages/`, `server/src`, `ui/src`, `cli/src`, `packages/plugins/sandbox-providers`, DB migrations.

## Executive summary

This is a high-value but high-blast-radius update. The biggest value for Paper-01 is
not cosmetic UI polish; it is stronger agent operation control:

- better deliverable inspection through artifacts, attachment previews, video, and workspace file viewer;
- task watchdogs for stopped issue trees;
- stronger recovery/heartbeat/session handling;
- skills store and teams catalog foundations;
- broader CLI/API parity for operator automation;
- low-trust/source-trust containment and multi-tenant isolation groundwork;
- adapter/sandbox expansion and runtime hardening.

The update is useful for our Paperclip workflow, but it is not safe to release solely
from review. The candidate still needs the remaining verification stages: serialized
suite shards, build, `prepare:ui-dist`, disposable smoke, and final release checklist.

## Product and workflow value

### 1. Artifacts, issue output, video, and file viewer

Relevant changes:

- Company Artifacts page indexes work products across issues/runs.
- Artifacts can be grouped by task stack.
- Issue attachments support richer previews and inline video playback.
- Workspace file viewer and workspace file links let reviewers inspect agent-produced files from the UI.
- Agent artifact workflow docs now explicitly require uploading reviewable deliverables instead of leaving only local paths.

Paper-01 use:

- Make screenshots, videos, reports, CSVs, generated HTML, and QA evidence first-class outputs.
- Stop accepting final comments that only name a local workspace path when the output should be reviewed.
- For frontend/E2E work, require a screenshot or video artifact on non-trivial UI changes.
- For reports, require uploaded Markdown/CSV/HTML artifacts or workspace-file work products.

Attention points after release:

- Check Artifacts page and issue-level output surfaces on a real issue.
- Verify video preview behavior in browser.
- Confirm agents use artifact upload helpers from their runtime environment rather than host-local paths.

### 2. Task watchdog control plane

Relevant changes:

- New `issue_watchdogs` table and `GET/PUT/DELETE /api/issues/:id/watchdog`.
- Watchdog can be configured at issue creation or from Issue Properties.
- It watches an issue subtree after all leaves stop and creates/reopens one review task with `originKind = task_watchdog`.
- Watchdog authority is scoped to the watched subtree and cannot bypass board-only approvals or typed execution policy stages.

Paper-01 use:

- Use watchdogs for important multi-agent trees where false "done", stale blocker, or abandoned review would be expensive.
- Configure watchdog instructions narrowly: what evidence to check, what shortcuts to reject, when to reopen.
- Treat watchdog as verification/recovery, not as a live process silence monitor.

Attention points after release:

- Enable/use watchdog only on selected important tasks first.
- Verify that watchdog-generated review tasks are visible and do not recursively watch themselves.
- Update agent instructions only after release if we want agents to suggest watchdogs in planning flows.

### 3. Skills Store

Relevant changes:

- New in-app Skills Store with bundled catalog and company-installed skill library.
- Skill install/fork/version/star/comment/update/audit API surfaces.
- Catalog includes bundled skills such as issue triage, task planning, QA acceptance, doc maintenance, GitHub PR workflow, wireframe, and optional skills such as agent browser, release announcement, design critique, last30days.
- External skills are constrained by trust level; script-bearing external skills are blocked.

Paper-01 use:

- Start using the catalog as the discovery source before creating ad-hoc local skills.
- Use installed company skills as managed workflow capabilities, not only filesystem instructions.
- Audit and update catalog-installed skills instead of silently editing copies.

Attention points after release:

- Do not auto-install or sync broad skills to every agent immediately.
- Decide which bundled skills we want as default for our active roles.
- Keep executable/script skills owner-reviewed.

### 4. Teams Catalog

Relevant changes:

- New `@paperclipai/teams-catalog` package with bundled/default teams:
  - core exec team: CEO, CTO, QA, starter project, first heartbeat;
  - product engineering pod: CTO, Senior Coder, QA;
  - product design team: UX Designer;
  - optional content-machine team.
- Current legacy onboarding assets are intentionally kept; catalog onboarding is not yet replacing them.

Paper-01 use:

- Useful mostly for future company bootstrap and repeatable agent org templates.
- Not something to apply automatically to our current Paper-01 company.

Attention points after release:

- Treat as opt-in; do not import bundled teams into existing org without a separate decision.
- Good future source for hiring/config templates when creating new Paperclip companies.

### 5. CLI/API parity

Relevant changes:

- CLI gained many control-plane commands: access, adapter, asset, connect, cost, goal, project, prompt, run, skill, teams, token, workspace, broader issue subresources.
- CLI now sends `X-Paperclip-Run-Id` so agents can mutate their own issue context through the CLI.
- OpenAPI/auth metadata and parity tests expanded.

Paper-01 use:

- More operator tasks can move from fragile direct API/curl scripts to `paperclipai` CLI.
- Agent-side helper scripts can use CLI where API parity now exists.
- Better foundation for repeatable ops scripts around tasks, teams, tokens, projects, and workspaces.

Attention points after release:

- Check our existing helper scripts for routes that should be replaced by CLI commands.
- Be careful with live context leakage: CLI commands now carry company context more aggressively.

### 6. Low-trust and source-trust containment

Relevant changes:

- `low_trust_review` preset for hostile/untrusted inputs.
- Source trust metadata on issues, comments, documents, and work products.
- Runtime containment requires sandbox driver, isolated workspace mode, scoped boundary, explicit secret bindings, and rejects inline sensitive env values.

Paper-01 use:

- Strong candidate for future untrusted PR review, external ticket ingestion, dependency diff review, or vendor-provided content analysis.
- This is not a general privacy system; it is containment for hostile automated work.

Attention points after release:

- Do not mark current trusted production workflows as low-trust by default.
- Low-trust requires a sandboxed environment; host-local adapters are not enough.
- Needs separate policy rollout before real external/untrusted work.

### 7. Adapter and sandbox execution changes

Relevant changes:

- Kubernetes sandbox provider plugin and server-side Kubernetes execution integration.
- Novita sandbox provider.
- Agent runtime Docker images for sandboxed execution.
- Env-driven gateway routing for `codex_local`, `pi_local`, `opencode_local`, and `gemini_local`.
- Gemini CLI bundled in Docker image.
- GPT-5.5 added to Codex local model options.
- Hermes/custom provider handling, OpenClaw Gateway stabilization, Claude refusal error code.

Paper-01 use:

- Useful groundwork for isolated execution and custom model gateways.
- GPT-5.5 option is directly relevant to our Codex local/operator model choices.
- Gateway routing can reduce hard-coded adapter config over time.

Attention points after release:

- Do not enable Kubernetes/Novita/new sandbox providers on Paper-01 by default.
- Keep our current local runtime path unless we explicitly test provider configuration.
- Verify our second Codex lane and OpenCode isolated workspace guard remain intact in the candidate reconciliation stage.

### 8. Heartbeat, recovery, run finalization, and session behavior

Relevant changes:

- Startup reaps orphan/zombie execution state before timer ticks.
- Execution locks clear on reassignment/release/finalization and cross-agent reassignment.
- Stale checkout ownership adoption and backstop sweepers.
- Recovery skips pending wake interactions and recent visible progress.
- Same-issue force-fresh-session wakes defer into follow-up runs.
- Session id validation before resume, model/adapter swap resets, Gemini/Claude recovery improvements.
- Heartbeat preflight budget caps.

Paper-01 use:

- Directly valuable for our agent reliability: fewer zombie locks, stale sessions, duplicate wakes, and incorrect recovery escalations.
- Better behavior after service restarts and after agent model/adapter changes.

Attention points after release:

- Watch first real agent runs after release for unexpected recovery comments or reopens.
- Check startup logs for orphan reap activity.
- Verify our QA FAIL and comment-wake workflows still behave after low-trust/read-auth tightening.

### 9. Routines

Relevant changes:

- Scheduled ticks are suppressed while a project is paused.
- Archived routines hidden.
- Routine view defaults by project.
- Routine detail page redesigned with sub-sidebar and editable/operate sections.
- Routine variable detection handles markdown-escaped underscores.

Paper-01 use:

- Better routine hygiene: paused project should not keep waking agents.
- More usable routine UI for our recurring agent management workflows.

Attention points after release:

- Check existing recurring routines after migration.
- Confirm paused project behavior is what we expect; paused projects will now be quieter.

### 10. Security, auth, and tenancy

Relevant changes:

- Per-company JWT signing keys.
- Cloud tenant actor is company-scoped, not instance-admin.
- Plugin tables receive `company_id` FK isolation.
- Plugin tool endpoints accept agent JWTs where appropriate.
- Read auth is enforced for issue threads and single issue comments.
- HTTP error logs redact passwords/tokens.
- `TRUST_PROXY` supports CIDR/named subnet config.
- Board members can perform null-mapped visibility actions agents already had.

Paper-01 use:

- Stronger safety foundation even though Paper-01 is owner-only today.
- Important if we later run multiple companies or plugin-heavy flows.

Attention points after release:

- Re-test access to issue comments/threads for owner/operator and active agents.
- Watch plugin routes for company scoping assumptions.
- Review proxy config separately only if Paper-01 deployment needs it.

### 11. UI/UX shell and working surfaces

Relevant changes:

- Collapsible sidebar rail and takeover panes.
- Experimental IA refresh for projects/agents.
- Company settings now host instance settings.
- Conference-room chat/onboarding surfaces behind experimental flag.
- Board chat page.
- PWA standalone browser controls.
- Theme defaults to system preference and auth page gets theme toggle.
- Mobile horizontal scroll fixes and desktop shell scroll fixes.

Paper-01 use:

- Potentially more usable UI for repeated operator work.
- Board chat/conference-room chat should be considered experimental until manually checked.

Attention points after release:

- Browser smoke must include issue list, issue detail, settings, routines, artifacts, and agent detail.
- Check mobile/desktop shell for navigation regressions.

### 12. Release, CI, and contributor workflow

Relevant changes:

- Commitperclip PR quality/security gates.
- GitHub issue forms and PR template changes.
- General server CI sharding upstream.
- Release publishing guards for workspace packages.
- Release smoke workflow changes.
- Dependabot/action/package dependency bumps, including Vitest 4 and Radix updates.

Paper-01 use:

- Useful mostly upstream/dev-process side, less direct runtime value.
- Vitest/Radix updates caused some local test expectation stabilization in candidate.

Attention points after release:

- Not a live runtime blocker, but local verification can be slower/noisier because the suite grew.

## Database/migration attention

Incoming migrations in candidate:

- `0094_backfill_archived_company_agent_pauses`: updates agents in archived companies to paused.
- `0095_issue_comment_tombstones`: soft-delete metadata for issue comments.
- `0096_document_annotation_issue_comment_links`: links annotation comments to issue comments.
- `0097_low_trust_source_trust`: JSONB source-trust columns on issues/comments/documents/work products.
- `0098_project_icon`: adds project icon.
- `0099_skills_store_foundation`: adds skills store columns/tables/indexes.
- `0100_skill_install_count_backfill`: ensures `company_skills.install_count` is non-null.
- `0101_plugin_company_id_tenant_isolation`: adds company scoping to plugin tables and recreates plugin entity uniqueness.
- `0102_managed_sandbox_dedup_index`: dedups Paperclip-managed sandbox environments and creates partial unique index.
- `0103_agent_error_reason`: adds `agents.error_reason`.
- `0104_issue_watchdogs`: adds task watchdog table and uniqueness/indexes.
- `0105_heartbeat_run_recent_history_indexes`: our local heartbeat history index migration renumbered to avoid upstream `0094` collision.

Risk notes:

- Most migrations are additive, but `0094`, `0101`, and `0102` are operationally important.
- `0094` updates live agent rows if any company is archived.
- `0101` changes plugin uniqueness to include `company_id`; plugin data scoping needs smoke.
- `0102` deletes duplicate managed sandbox rows for Paperclip-managed sandbox environments only.
- The migration-number collision with our local `0094_heartbeat_run_recent_history_indexes` was real and had to be reconciled as `0105`.

## Practical value for our Paper-01 workflow

Start using after release:

- Artifacts/work products as the expected deliverable path for inspectable outputs.
- Workspace file viewer for source/workspace artifacts.
- Task watchdogs on important stopped issue trees.
- CLI/API parity for operator helper scripts.
- Skills Store as the first discovery layer for reusable agent workflows.
- Paused-project routine suppression.

Use only after separate decision:

- Low-trust review execution.
- Kubernetes/Novita/remote sandbox providers.
- Teams Catalog imports into existing company.
- Conference-room chat/Board Chat as a primary workflow.
- OpenTelemetry tracing.

Watch carefully:

- Access/read-auth behavior around comments and issue threads.
- Startup recovery/orphan reaping.
- Plugin company scoping.
- Existing routines after paused-project behavior changes.
- UI shell/navigation after sidebar and Radix updates.

## Stage-1 verdict

The incoming master is valuable and worth continuing. It addresses several pain points
we care about: reviewable outputs, stopped-work recovery, runtime/session reliability,
skills management, and safer low-trust foundations.

It is not release-approved yet. The update is broad enough that we should continue with
the remaining short stages before live update:

1. Candidate reconciliation summary.
2. Short verification checkpoint.
3. Serialized suite shards.
4. Build, `prepare:ui-dist`, disposable smoke.
5. Final safe/not-safe release verdict.
