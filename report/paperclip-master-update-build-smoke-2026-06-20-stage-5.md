# Paperclip Master Update Stage 5: Build And Smoke

Date: 2026-06-20

Candidate branch: `merge/master-into-dev-20260620`

Candidate before this report: `30198636`

Live `dev` status during this stage: not modified; live remained on `392472c8`.

## Scope

This stage covered the final candidate release checks after stages 1-4:

- dependency install
- production build
- `server/ui-dist` preparation
- disposable candidate instance migration
- API smoke on the disposable instance
- browser smoke on the disposable instance
- cleanup of disposable processes and temp directories

No live Paperclip checkout, database, service, or remote branch was changed.

## Build

Passed:

- `pnpm install --frozen-lockfile`
- `pnpm run build`
- `PAPERCLIP_RELEASE_REUSE_UI_DIST=1 pnpm --filter @paperclipai/server prepare:ui-dist`

Prepared UI bundle:

- `/assets/index-CnwzzWyY.js`

`server/ui-dist/index.html` matched `ui/dist/index.html` after `prepare:ui-dist`.

Observed build warnings, non-blocking:

- CSS optimizer warnings for `::highlight(paperclip-doc-annotation-...)`.
- Vite warning for mixed dynamic/static import of `MarkdownEditor`.
- Chunk-size warnings for large UI/plugin bundles.

## Disposable Runtime

Disposable instance:

- Temp home: `/tmp/paperclip-stage5-20260620.IuCmD9`
- Server port: `44653`
- Embedded Postgres port: `45593`

Passed:

- local onboard/config creation for disposable instance
- `pnpm db:migrate` against disposable config
- `paperclipai doctor`: 9/9 checks passed
- candidate server started in static-ui mode

Note: direct `pnpm --filter @paperclipai/server start` in the monorepo candidate failed because Node attempted to load the workspace `packages/db/src/index.ts` through the built server entrypoint. The disposable smoke therefore used the established source-mode CLI path:

```bash
pnpm paperclipai run --data-dir /tmp/paperclip-stage5-20260620.IuCmD9
```

with `PAPERCLIP_UI_DEV_MIDDLEWARE=false`, `HEARTBEAT_SCHEDULER_ENABLED=false`, and the disposable config path. The server banner confirmed `static-ui` mode and the prepared UI bundle was served.

## API Smoke

Passed on the disposable instance:

- `/api/health`
- root HTML and prepared JS asset
- create company/project/goal
- skills catalog browse
- teams catalog browse
- create assignee/reviewer agents and agent API keys
- resource membership join
- create parent issue and blocker issue
- set and clear `blockedByIssueIds`
- create plan document
- document annotation create/comment/resolve
- accept plan via `request_confirmation`
- accepted-plan decomposition exact-once retry
- ZIP attachment upload and content fetch
- work product creation from uploaded attachment
- QA FAIL return-to-todo via structured same-company agent mention grant
- issue list fetch

Smoke result:

```json
{
  "ok": true,
  "asset": "/assets/index-CnwzzWyY.js",
  "companyId": "b3eab0c6-439f-431a-bec2-431ee55ad821",
  "projectId": "fc37d49e-8a4e-4087-8c2f-646ff14a4ebd",
  "parentIssueId": "bbb5a488-34ee-4e1b-97d6-dd7169d36235",
  "blockerIssueId": "07692dd7-1175-4dd6-8960-7e793435c2f8",
  "decomposedChildId": "f51d028b-e1ef-47f3-a39e-e38542279da2",
  "attachmentId": "2fe8515c-791e-4806-bc12-faa720a19fde",
  "workProductId": "a78e6552-a3d0-44fb-aa43-90bdfd45d52a",
  "skillsCatalogCount": 10,
  "teamsCatalogCount": 4,
  "finalParentStatus": "todo",
  "issueCount": 3
}
```

## Browser Smoke

Passed with Chromium against the disposable instance:

- `/`
- `/issues`
- `/issues/STAAAAAAA-1`

Verified:

- root HTML returned 200
- prepared asset `/assets/index-CnwzzWyY.js` returned 200
- `#root` attached
- rendered body text was non-empty
- issue list route rendered task UI text
- issue deep link rendered the issue reference
- no page errors
- no significant failed requests after filtering expected navigation `net::ERR_ABORTED` aborts

## Cleanup

Completed:

- disposable server process stopped
- disposable embedded Postgres process stopped
- `/tmp/paperclip-stage5-20260620.IuCmD9` removed
- `/tmp/paperclip-stage5-20260620.QMSsea` removed
- no remaining `paperclip-stage5`, `PORT=44653`, `45593`, or `paperclipai run --data-dir /tmp/paperclip-stage5` processes

Live `paperclip.service` remained healthy after cleanup.

## Verdict

Stage 5 passed.

Candidate is ready for owner review and live release approval.

Do not update live `dev`, push release refs, migrate the live database, or restart `paperclip.service` until owner approval is explicitly given for the live release step.
