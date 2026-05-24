# Paperclip migration review, 2026-05-24

## Scope

Live `dev` currently includes migrations through `0081`. This update adds `0082` through `0089`.

Expected live-release order:

1. Create one-off DB backup.
2. Confirm current migration status is `upToDate` before merge, then `needsMigrations` with pending `0082..0089` after merge.
3. Stop `paperclip.service`.
4. Apply migrations.
5. Start service and verify migration status `upToDate`.

## New migrations

### `0082_dry_vision.sql`

Purpose:

- Creates `company_secret_bindings`.
- Creates `secret_access_events`.
- Adds stable `company_secrets.key`, status, managed mode, provider metadata, rotation timestamps, soft delete.
- Adds provider version/fingerprint/status fields to `company_secret_versions`.
- Backfills keys and fingerprints, then adds indexes and uniqueness.

Risk:

- Broad writes to existing `company_secrets` and `company_secret_versions`.
- `company_secrets.key` becomes `NOT NULL`; duplicate keys are rewritten by appending row rank.
- `company_secret_versions.fingerprint_sha256` becomes `NOT NULL` after backfill from `value_sha256`.
- Low destructive risk, but medium lock/backfill risk depending on number of stored secrets.

Paper-01 relevance:

- Enables provider-vault and secret-binding workflows. Good direction, but should not be used for production secrets until provider setup and audit path are reviewed.

### `0083_company_secret_provider_configs.sql`

Purpose:

- Creates `company_secret_provider_configs`.
- Adds FK from `company_secrets.provider_config_id`.
- Converts `company_secrets.provider_config_id` from text to uuid.
- Clears any non-UUID prior provider config ids to `NULL`.

Risk:

- Important data-risk line: non-UUID `provider_config_id` values are discarded before type conversion.
- Likely safe if the column was unused/free-form on Paper-01, but verify before release if any provider config data exists.

Paper-01 relevance:

- Foundation for AWS/provider vault import. Treat as security-sensitive but opt-in.

### `0084_issue_recovery_actions.sql`

Purpose:

- Adds first-class `issue_recovery_actions` table.
- Adds source/recovery issue links, owner fields, evidence, wake policy, monitor policy, outcome, and unique active indexes.

Risk:

- Additive schema.
- Unique indexes can reject duplicate active recovery actions once runtime starts enforcing them.

Paper-01 relevance:

- High value. Replaces ad hoc recovery comments/tasks with inspectable source-scoped recovery state.

### `0085_tranquil_the_executioner.sql`

Purpose:

- Adds document lock fields: `locked_at`, `locked_by_agent_id`, `locked_by_user_id`.
- Adds FK from locked agent.

Risk:

- Additive nullable columns. Low migration risk.

Paper-01 relevance:

- Useful for reviewed plans/specs/release artifacts.

### `0086_routine_env_runtime_contract.sql`

Purpose:

- Adds `routines.env`.
- Adds `routine_runs.routine_revision_id` and FK to `routine_revisions`.
- Adds index on routine run revision.

Risk:

- Additive nullable columns. Low migration risk.

Paper-01 relevance:

- Supports routine env/secrets runtime contract. Useful for recurring agents once validated.

### `0087_backfill_environment_manage_human_defaults.sql`

Purpose:

- Grants `environments:manage` to active owner/admin user memberships.

Risk:

- Broad data write to `principal_permission_grants`.
- Expands environment management permissions for existing human owners/admins.

Paper-01 relevance:

- Expected for owner/admin operators. Verify no unintended non-owner/admin users receive environment management.

### `0088_backfill_principal_access_compatibility.sql`

Purpose:

- Backfills active agent memberships for non-pending/non-terminated agents.
- Backfills role-default permission grants for active human memberships.

Risk:

- Broad compatibility backfill across agents and users.
- Permission expansion includes agent creation, environment management, invites, assignment, join approval, and permission management based on role.
- High-attention migration for Paper-01 because access/agent boundaries are core operator safety.

Paper-01 release check:

- After migration, inspect a small sample of owner/admin/operator grants.
- Confirm agents did not gain unexpected human-level permissions.

### `0089_cloud_upstreams.sql`

Purpose:

- Creates `cloud_upstream_connections`.
- Creates `cloud_upstream_runs`.
- Stores upstream identity, OAuth/token state, source public/private key material, sync target details, run progress, warnings/conflicts/report.

Risk:

- Additive schema but security-sensitive: includes `private_key_pem`, `access_token`, token state, and remote URLs.
- Startup reconciliation hook is enabled in `server/src/index.ts`.

Paper-01 relevance:

- Potentially valuable for future cloud/local sync, but should remain unused until a separate security/product review.

## Overall assessment

- No migration drops tables or deletes existing rows.
- Most DDL is additive.
- Highest attention items:
  - `0083` clears non-UUID provider config ids.
  - `0087` and `0088` backfill permissions.
  - `0089` introduces sensitive cloud upstream credential storage.
  - `0082` performs secret key/fingerprint backfills and creates uniqueness constraints.

## Release gate

Do not deploy without:

- Fresh DB backup.
- Pre-migration status snapshot.
- Migration apply with service stopped.
- Post-migration `upToDate`.
- Post-release smoke for health, auth/UI shell, issue list/detail, attachments, recovery actions, blocked inbox, and secrets/cloud settings visibility.

Candidate pre-release checks completed:

- Full build passed after preparing `server/ui-dist`.
- Disposable embedded-Postgres instance started from the candidate and applied migrations on first run.
- Smoke passed for health, issue CRUD, blockers, plan document, confirmation interaction, zip attachment, QA FAIL reopen, UI shell, and browser issue-detail deep link.

Live release still requires the fresh production backup and controlled migration window.
