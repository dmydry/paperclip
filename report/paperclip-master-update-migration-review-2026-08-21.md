# Paperclip master update migration review — Phase 0/1

Date: 2026-08-21 (Asia/Makassar)

Status: review only; no live migration was run.

## Current live state

- Live source: `origin/dev` at `a0ed84d24d1e75c6c199bba9a31c9c3f66c31fca`.
- Read-only `inspectMigrations` result: `upToDate`.
- Public table count: 157.
- Latest available and applied local migration: `0197_heartbeat_run_recent_history_indexes.sql`.

## Incoming sequence

`origin/master` at `733ffbf7c3e24942138d1d610494d7b22945918c` adds 30 SQL migrations numbered `0197` through `0226`.

Material groups:

- `0197–0200`: Decisions, queues, triage and retention tables/indexes.
- `0201–0202`: external-object refresh state.
- `0203–0204`: interaction resolver governance and explicit agent addressee.
- `0205`: comment `on_behalf_of_user_id` plus a data backfill.
- `0206`: recovery idempotency index.
- `0207`: human-approved secret proposals.
- `0208`: issue review policy.
- `0209–0210`: heartbeat JSON-context indexes.
- `0211`: drops the old unique connection-name index to support multiple provider connections.
- `0212`: unique onboarding-first-task index.
- `0213`: durable company transfer runs.
- `0214–0216`: adapter auth sessions, promotion expiry and onboarding seeds.
- `0217`: replaces several issue foreign keys and changes delete behavior.
- `0218`: changes defaults for new interaction resolvers to `anyone` and rewrites existing policy names conservatively.
- `0219–0220`: runtime exposure fields and durable runtime leases.
- `0221`: Claude setup-token sessions.
- `0222`: environment lease references survive environment deletion.
- `0223`: links secret proposals to interactions.
- `0224`: deletes temporary rows from `adapter_auth_sessions`, adds public/binding fields and new uniqueness rules.
- `0225`: removes the superseded `claude_setup_token_sessions` table.
- `0226`: disposition-repair idempotency index.

## Number collision and resolution

The live fork has already applied a different migration with number `0197`. The candidate must:

1. Rename our file to `0227_heartbeat_run_recent_history_indexes.sql`.
2. Preserve its SQL content byte-for-byte so the existing Drizzle migration hash still resolves it as applied.
3. Replace the local journal entry with a final, strictly ordered `0227` entry after upstream `0226`.
4. Never edit or delete the live migration journal manually.

The current migration inspector maps applied hashes back to available filenames, so a content-preserving rename is compatible by design. This remains a hypothesis until proven against a disposable restore of the live backup.

## Preflight checks on disposable restore

1. Before applying anything, assert that the restored DB recognizes `0227_heartbeat_run_recent_history_indexes.sql` as already applied.
2. Confirm the pending list is exactly upstream `0197…0226`, with no historical migration unexpectedly pending.
3. Check for duplicates that could make `0212` fail.
4. Confirm no live adapter-login/setup flow is expected to survive `0224/0225`; these tables contain temporary login sessions, not agent credentials.
5. Measure the lock/runtime cost of `0209`, `0210`, `0212`, `0217` and `0226` on the restored data volume.
6. Apply all pending migrations with the normal migration runner.
7. Assert `upToDate`, restart the disposable server, and assert `upToDate` again.
8. Run targeted issue delete, interaction resolution, secret proposal, adapter login, runtime lease and Decisions smoke checks.

## Release-time migration gate

- Take and verify a fresh backup before stopping the service.
- Release only with no active adapter login/setup session and after agent runs have drained.
- Stop the server before applying migrations; this bounds normal index/FK locks and prevents writes during `0217/0218/0224`.
- Abort before service start if the pending list differs from the Phase 2 evidence or if migration inspection is not `upToDate` afterward.
- Rollback means restoring the pre-release database backup together with the pre-release source/operator snapshot; source rollback alone is insufficient after schema migration.

## Risk assessment

Overall migration risk: **medium**, dominated by the applied `0197` number collision and the FK/policy/session migrations. There is a direct, testable reconciliation path; no manual production data rewrite is proposed.
