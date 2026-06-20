# Paperclip Master Update Serialized Verification - Stage 4

Date: 2026-06-20
Candidate branch: `merge/master-into-dev-20260620`
Candidate head before report: `e1caa1e2`
Live dev head during verification: `392472c8`

## Scope

Stage 4 covered the serialized server test matrix only. No live `dev` merge, push, migration, restart, build, or smoke was performed.

Command shape:

```bash
node scripts/run-vitest-stable.mjs --mode serialized --shard-index <0..3> --shard-count 4
```

The runner selected 97 serialized suites total.

## Results

- Shard 1/4: passed, 25/25 suites.
- Shard 2/4: passed, 24/24 suites.
- Shard 3/4: initially failed in `server/src/__tests__/issues-service.test.ts`, then passed after a candidate fix, 24/24 suites.
- Shard 4/4: passed, 24/24 suites.

Final serialized result after rerun: 97/97 suites passed.

## Blocker Found And Fixed

Shard 3/4 exposed a merge-reconciliation bug in `issueService.findMentionedAgents`.

Failure:

- `resolves only structured same-company agent mentions`
- `does not wake agents from raw @name text without a structured mention`

Cause:

The merge had preserved the older raw `@Name` fallback in production mention resolution. That conflicted with the incoming low-trust/security contract, where agent wakeups must come from structured agent mention links and must be scoped to the same company.

Fix:

- `findMentionedAgents` now uses structured mention IDs from `extractAgentMentionIds`.
- Mention IDs are filtered to agents that belong to the current company.
- Raw `@Name` text no longer wakes agents.
- The legacy raw-name parser unit remains as pure parser coverage, but it is no longer used for production wakeup resolution.

Fix commit:

- `e1caa1e2 Align agent mention wakeups with structured mentions`

Targeted checks after the fix:

- `pnpm --filter @paperclipai/server exec vitest run src/__tests__/issues-service.test.ts --pool=forks --isolate`: passed, 90/90 tests.
- `pnpm --filter @paperclipai/server exec vitest run src/__tests__/issue-agent-mentions.test.ts --pool=forks --isolate`: passed, 3/3 tests.
- `pnpm --filter @paperclipai/server typecheck`: passed.
- `git diff --check`: passed.

## Notable Expected Test Noise

The serialized suite emitted expected negative-path logs from tests that intentionally exercise failure handling:

- heartbeat recovery and orphan reaping warnings;
- missing secret binding / workspace validation failures;
- failed scheduled-retry cancellation fallback;
- health DB probe failure;
- missing run-log fallback while deriving issue comment metadata.

All affected files completed with passing test summaries.

## Remaining Release Gates

Stage 4 does not make the candidate releasable by itself. Remaining gates:

1. `pnpm run build`
2. `pnpm --filter @paperclipai/server prepare:ui-dist`
3. Disposable candidate smoke
4. Final safety verdict and owner approval before live release

