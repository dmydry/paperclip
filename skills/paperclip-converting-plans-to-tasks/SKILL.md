---
name: paperclip-converting-plans-to-tasks
description: >
  Decide whether Paperclip work needs delegation, and connect justified tasks
  with owners and real dependencies. Use when turning an authorized plan into work.
---

# Plans to tasks

Keep small, cohesive work on its current ordinary task with one end-to-end owner.
A plan's steps, files, and phases do not each need a task.

Create a separate task only for a useful boundary: another owner or permission,
independent parallel output, a real prerequisite, independent review, or substantial
follow-up that needs its own lifecycle. Check the available agents before assigning.
Give each delegate enough context and a clear deliverable to work independently.

Set real dependencies through `blockedByIssueIds` (or the native dependency tool).
Parent/child nesting and prose do not delay execution. Independent work can start
now; dependent work must wait for its prerequisite. Verify the saved relationships.

After a `request_confirmation` targeting the `plan` document is accepted, the acceptance is only a decision record. It does **not** create issues. If the accepted plan is supposed to become a backlog or execution batch, check existing decompositions with `GET /api/issues/{issueId}/accepted-plan-decompositions`, then materialize the approved child set with `POST /api/issues/{issueId}/accepted-plan-decompositions` and the accepted plan revision id. Use `status: "backlog"` for sprint or future backlog batches, even when tasks already have assignees; use `todo` only when execution should start immediately.

Reviewers publish findings on their own review task and complete it, including an
adverse verdict. Make its description self-contained. Connect the verdict to the
owner who must act on it; do not require writes to the parent.

Honor existing authorization and approval boundaries. Use Paperclip's planning
mechanics when approval is required; decomposition does not create new approval gates.
