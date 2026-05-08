# Paperclip master update migration review - 2026-05-08

Scope: `origin/dev..master` database changes in review branch `merge/master-into-dev-20260508`.

## Summary

The incoming update adds migrations `0060` through `0081`. The set is mostly additive: new tables, nullable columns, metadata columns, dedupe indexes, search indexes, and one default change. No migration drops a table or deletes user-facing core data.

High-risk live surfaces are:

- migration execution order and journal consistency across 22 new SQL files
- PostgreSQL extension availability for `fuzzystrmatch`
- GIN index creation on `documents.title` and `documents.latest_body`
- unique index creation on active recovery/productivity/routine rows
- default company policy change for `require_board_approval_for_new_agents`
- attachment cap default at 10 MB

## Migration Groups

### References and Search

- `0060_orange_annihilus.sql`: creates `issue_reference_mentions`, indexes issue-to-issue mentions, and cleans duplicate mention rows before adding unique indexes.
- `0079_company_search_document_indexes.sql`: adds `documents_title_search_idx` and `documents_latest_body_search_idx` using `gin_trgm_ops`.
- `0080_company_search_fuzzystrmatch.sql`: creates `fuzzystrmatch` extension.

Risk:

- `0079` depends on `pg_trgm`; existing migration `0051_young_korg.sql` already creates it.
- `0080` needs extension creation privileges. Embedded Postgres should be fine; managed Postgres could require elevated migration role.
- GIN indexes may take noticeable time on large document bodies. Paper-01 dataset is expected to be small enough, but live deploy should not skip backup.

### Interaction and Planning Workflow

- `0063_issue_thread_interactions.sql`: creates pending/resolved issue-thread interaction records.
- `0064_issue_thread_interaction_idempotency.sql`: adds `idempotency_key` and unique index.
- `0066_issue_tree_holds.sql`: creates issue-tree hold tables and member snapshots.
- `0081_optimal_dormammu.sql`: adds `issues.work_mode` defaulting to `standard`.

Risk:

- Additive schema only, but this directly affects owner approval, blocker, and planning flows.
- Smoke must include pending interaction creation/resolution and a plan/in-review issue path.

### Environments and Runtime Leasing

- `0065_environments.sql`: creates `environments` and `environment_leases`.
- `0067_agent_default_environment.sql`: adds `agents.default_environment_id`.
- `0068_environment_local_driver_unique.sql`: changes uniqueness so only one `local` environment exists per company.

Risk:

- This is a new execution-control layer. Existing local agents should continue with local/default behavior, but smoke must check agent config page and heartbeat execution.
- Do not enable E2B/cloud environments in live instructions until local behavior is verified.

### Heartbeat Recovery and Watchdog

- `0061_lively_thor_girl.sql`: adds scheduled retry fields to `heartbeat_runs`.
- `0069_liveness_recovery_dedupe.sql`: adds active liveness recovery unique indexes.
- `0070_active_run_output_watchdog.sql`: tracks run output and creates watchdog decision records.
- `0072_large_sandman.sql`: adds active stranded issue recovery unique index.
- `0074_striped_genesis.sql`: adds active productivity review unique index.
- `0075_cultured_sebastian_shaw.sql`: adds monitor scheduling fields to `issues`.

Risk:

- Unique indexes can fail if live data already has duplicate active recovery/productivity issues. Preflight should query for duplicates if migration fails; do not manually delete rows without owner approval.
- Smoke must check that a normal heartbeat does not create unexpected recovery issues and that active run UI still streams output.

### Routines and Plugins

- `0062_routine_run_dispatch_fingerprint.sql`: adds routine dispatch fingerprinting and recreates open routine execution uniqueness.
- `0076_useful_elektra.sql`: creates `plugin_managed_resources`.
- `0077_unusual_karnak.sql`: creates routine revisions, backfills revision rows from existing routines, and sets `latest_revision_id`.
- `0078_white_darwin.sql`: adds presentation/metadata fields to comments.

Risk:

- `0077` performs backfill `INSERT ... SELECT` plus two `UPDATE routines` statements. This is the only substantial data backfill in the set.
- Existing routines should be checked after deploy: list routines, open one, verify latest revision fields exist and no duplicate revision number errors.

### Company Defaults and Attachments

- `0071_default_hire_approval_off.sql`: changes default `companies.require_board_approval_for_new_agents` to `false`.
- `0073_shiny_salo.sql`: adds `companies.attachment_max_bytes` default `10485760`.

Risk:

- Existing companies keep existing `require_board_approval_for_new_agents` values; new companies default to less restrictive hiring. For Paper-01 owner-only workflow, verify current company setting after migration and explicitly keep approval policy if desired.
- Attachment cap becomes 10 MB unless live company row is updated. Our zip attachment workflow may need a higher cap after live smoke.

## Backup Plan for Live Update

Before applying migrations to live `dev`:

1. Confirm live service source and branch:
   - `systemctl show paperclip.service -p ActiveState -p WorkingDirectory --no-pager`
   - `git -C /Users/dmydry/projects/paperclip status --short --branch`
2. Create a database backup while the embedded Postgres is running:
   - `cd /Users/dmydry/projects/paperclip`
   - `pnpm db:backup`
3. Record the backup path from command output without exposing secrets.
4. Confirm migration status before applying:
   - `pnpm --filter @paperclipai/db exec tsx src/migration-status.ts --json`
5. Apply migrations only during the approved release step:
   - via server startup with `PAPERCLIP_MIGRATION_AUTO_APPLY=true`, or explicitly `pnpm db:migrate`
6. Recheck migration status:
   - `pnpm --filter @paperclipai/db exec tsx src/migration-status.ts --json`
7. Run live smoke before allowing agents to resume normal work.

Rollback posture:

- Code rollback alone may not remove additive DB schema. Treat rollback as service-code rollback against forward-compatible schema.
- Do not drop new tables/indexes/extensions during rollback unless a concrete production failure requires it and owner approves.
- If migration fails midway, stop and inspect the exact failing migration. Do not retry destructive cleanup blindly.

## Pre-approval Checks Already Completed

- `pnpm --filter @paperclipai/db run check:migrations`

Pending:

- disposable DB migration apply smoke
- full test/build matrix
- disposable UI/API smoke
