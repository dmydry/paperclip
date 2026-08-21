# Paperclip master update test evidence — Gate B

Date: 2026-08-21 (Asia/Makassar)

Candidate source/test commit: `a5c4b3a6b70115f5cdd38fdea44e67e76aa4dff8`.

No live Paperclip endpoint was used as a mutation/smoke target.

## Static and build verification

Passed:

- frozen dependency install;
- full workspace typecheck (all 33/34 runnable workspace projects);
- `@paperclipai/server` typecheck after the final authorization reconciliation;
- production build (all 33/34 runnable workspace projects);
- migration-safety build gate;
- `@paperclipai/server prepare:ui-dist`;
- `git diff --check`.

`ui/dist` and `server/ui-dist` contained 204 files each, their `index.html` files were byte-identical, and recursive comparison produced no diff.

Non-blocking build warnings were limited to known CSS `::highlight`, runtime-font, mixed static/dynamic import and large-chunk warnings.

## Test execution

Passed after reconciliation:

- all 137 server suites in four documented serialized shards;
- authorization service: 63/63;
- low-trust red-team routes: 11/11;
- issues service: 123/123;
- interaction routes: 70/70;
- issue ownership: 89/89;
- issue comment/reopen: 97/97;
- liveness escalation: 24/24;
- scheduler/blocker: 6/6;
- OpenCode core adapter environment: 3/3;
- document annotations: 7/7;
- built-in agents: 14/14;
- routines end-to-end: 5/5;
- full workspace aggregate and isolated coverage set: 133/133;
- remaining workspace group: 65 files / 461 tests.

The large parallel runs exposed resource/load artifacts rather than retained failures: seven server module-load failures, OpenCode parallel-load failures, and one untouched UI timing test. Each affected set passed when rerun in isolation/serialized mode; the final server shard containing the authorization fix also passed from start to finish. No test was disabled.

The UI run covered 468/469 files and 4300/4301 tests in the large pass; the single timing case passed 4/4 in isolation. This is recorded as a runner-load residual, not a product failure.

## Disposable fresh-instance smoke

Identity:

- temp data dir: `/tmp/paperclip-gateb-smoke.LsH9I6`;
- server: `127.0.0.1:3101`;
- embedded PostgreSQL: `127.0.0.1:54329`;
- mode: `local_trusted`, loopback, `static-ui`;
- heartbeat scheduler: disabled;
- data: synthetic disposable test records only.

Passed:

- all 226 candidate migrations on a fresh database;
- `/api/health` and production root asset;
- skills catalog: 17 entries;
- teams catalog: 4 entries;
- company, goal and project creation;
- issue creation with blocker, then blocker clear/readback;
- plan document creation;
- human-only `request_confirmation` create/accept/readback;
- Chromium navigation to `/`, `/issues` and the issue deep link;
- rendered issue title, no page errors and no failed requests.

Prepared bundle used in smoke: `/assets/index-DcKfHkY1.js`.

Cleanup passed: the disposable server and PostgreSQL stopped, ports 3101/54329 became free, and the exact temp data dir was removed.

## Current-live-copy migration proof

- Source snapshot: transaction-consistent, read-only `pg_dump` from the running live database; 1,506,240,343 bytes; SHA-256 `c6b543663baf88ca4f95ff128627af763d06f942a685e636b0218902dabdab79`.
- Restore target: disposable PostgreSQL 18 on `127.0.0.1:55439`; no live connection was used for migration apply.
- Pre-apply: 157 public tables; status `needsMigrations`; pending exactly 30 upstream files from `0197_decisions_v1.sql` through `0226_tan_colossus.sql`.
- `0227_heartbeat_run_recent_history_indexes.sql` was not pending, proving the already-applied live hash resolved to the content-preserved renamed file.
- Candidate migration safety check passed, then all 30 pending migrations applied successfully.
- Post-apply: 172 public tables; status `upToDate`; pending `[]`.
- Idempotence: a second `pnpm db:migrate` reported `No pending migrations`.
- End-to-end migration command, including safety checks, completed in about 12 seconds on the restored copy.
- Cleanup: temp PostgreSQL container stopped and auto-removed; port 55439 was free; the dump, restored database and temp config were removed.

## Verdict

Candidate verification is green and ready for Gate B approval of the final report-bearing SHA.
