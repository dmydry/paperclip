# Paperclip master update reconciliation — Gate B

Date: 2026-08-21 (Asia/Makassar)

Status: isolated candidate complete; no push, live merge, live migration, service restart, timer change, or live agent/config/instruction sync was performed.

## Exact inputs and candidate

- Gate A inputs: `origin/dev=a0ed84d24d1e75c6c199bba9a31c9c3f66c31fca`, `origin/master=733ffbf7c3e24942138d1d610494d7b22945918c`.
- Gate A scope: approved decision rows D01–D22 from the 2026-08-21 Phase 0/1 artifacts.
- Candidate branch: `merge/master-into-dev-20260821`.
- Isolated worktree: `/Users/dmydry/projects/paperclip-candidate-20260821`.
- Reconciled source/test commit before adding these Gate B reports: `a5c4b3a6b70115f5cdd38fdea44e67e76aa4dff8`.
- Gate B approval must name the final report-bearing `HEAD` supplied by the operator; the commit cannot self-record its own SHA.

## Reconciliation result

All 28 forecast content conflicts were resolved in the one candidate. Generated outputs were reconciled from source and regenerated where applicable.

| Surface | Result |
|---|---|
| Migration collision | Preserved the custom heartbeat-index SQL bytes, renamed it from local `0197` to final `0227`, and placed its journal row after upstream `0226`. |
| Authorization | Retained run-scoped comments for the current issue and direct parent only. Preserved explicit structured low-trust mention grants without reopening ordinary same-company writes. Removed the old company-wide comment bypass. |
| Accepted plans | Preserved target-project workspace selection and retry fingerprint normalization while accepting upstream plan/decomposition behavior. |
| Recovery | Kept the fork's source-scoped/standing-sprint loop guards only where upstream did not already supersede them; adapted to current recovery and successful-run handoff code. |
| Built-ins | Kept opt-in auto-provision gating. Company creation/reconciliation does not recreate Summarizer or Reflection Coach approvals by default. |
| Codex subscriptions | Kept `codex_subscription_2_local`, separate `CODEX_HOME`, blank inherited `OPENAI_API_KEY`, Terra/xhigh switch defaults, and source-owned subscription switching. No live agent model config changed. |
| OpenCode | Kept upstream Paperclip core adapter and tests. Paper-01 OpenCode usage remains retired; no OpenCode agents or host artifacts were recreated. |
| Instructions and BAL ops | Kept managed-bundle write boundaries and `ops/company-configs/balibikehouse/**`. No live skill or instruction sync ran. |
| Workspace/runtime | Accepted upstream multi-project workspace behavior, preserved project-local child workspaces, and kept allocator separation from managed app/HMR port ranges. |
| Test harness/UI | Accepted upstream runner/chat-first UI; retained only reproduced local stability requirements and conflict-specific regressions. |

One real compatibility defect was found during final serialized verification: upstream visible-write ordering initially blocked the fork's existing low-trust structured mention grant. The candidate now applies standard run containment after trust resolution, so ordinary run comments remain current/direct-parent only while an explicit low-trust grant still works.

## Migration reconciliation

- Candidate migration order is upstream `0197…0226`, then custom `0227_heartbeat_run_recent_history_indexes.sql`.
- Fresh disposable PostgreSQL applied all 226 candidate migrations successfully and started in `static-ui` mode.
- A read-only logical dump of the current live database was restored into disposable PostgreSQL 18. Before apply it had 157 public tables and pending exactly upstream `0197…0226`; custom `0227` was already recognized by its preserved hash. After applying those 30 migrations it had 172 tables, status `upToDate`, and an idempotent rerun reported no pending migrations.
- Production rollback boundary remains source plus database: after live schema migration, source-only rollback is not valid. A verified pre-release database backup is mandatory.

## Adoption boundary

Included in source but not automatically enabled here: Decisions desk, Activity/audit consolidation, secret proposals, chat-first tasks, multi-project sync, import/export and newer adapter-auth flows.

Still deferred: managed CLI install/update migration, replacing the two-subscription scripts with in-product login, forced runtime HTTPS broker installation, optional Apps/Connections and other experimental flags, and live SIN/BAL workflow/skill changes.

## Residual release risks

1. The schema update is large and includes FK/default/session-policy work; release must run with Paperclip stopped and a fresh backup already verified.
2. The PR-review timer can wake SIN work; the exact current unit `sinisana-pr-review-preflight-active.timer` should be stopped only for the release window and restored afterward. Janitor/read-only timers do not need blanket shutdown.
3. Final live model routing and skill/instruction reconciliation are separate post-core-release applies and require their own idle/readback gate.

## Verdict

The source candidate is ready for Gate B. Approval must bind the final report-bearing SHA and the exact companion install manifest.
