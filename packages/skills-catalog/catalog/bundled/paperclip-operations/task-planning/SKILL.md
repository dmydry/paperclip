---
name: task-planning
description: Turn a Paperclip issue or request into a structured implementation plan with child task graph, blockers, owners, and acceptance criteria, then save it as the issue `plan` document.
key: paperclipai/bundled/paperclip-operations/task-planning
recommendedForRoles:
  - manager
  - engineer
  - product
tags:
  - paperclip
  - planning
  - issues
  - delegation
---

# Task Planning

Produce implementation plans that the Paperclip executor can actually run: explicit child issues, real blockers, named owners, and a defined acceptance bar. Avoid plans that read well but cannot be split into work.

## When to use

- An issue asks you to "plan", "scope", "break down", "design the rollout", "propose the work", or similar.
- A user wants a written plan before approving implementation.
- A manager needs to delegate non-trivial work and the shape of the work is not obvious yet.
- You inherited an issue too large to deliver in one heartbeat and need to split it.

## When not to use

- The issue is a single small change you can ship in the same heartbeat. Just ship it.
- The issue is forensic ("why did this break"). Use a diagnosis skill first; plan only after the root cause is named.
- A current `plan` document already exists and the change is minor. Update that document; do not start fresh.

## Outputs

1. An updated issue document with key `plan` (markdown).
2. A short comment on the issue that links to the plan document and names the next action.
3. Where the plan requires approval, an issue-thread interaction of kind `request_confirmation` bound to the latest plan revision.
4. After that confirmation is accepted, a concrete materialization step through `POST /api/issues/{issueId}/accepted-plan-decompositions` or an explicit blocker explaining why the accepted plan cannot be materialized yet.

Do not create implementation subtasks until the plan is accepted.

## Plan structure

Required sections, in order:

1. **Goal** — one paragraph. What changes for the user, the operator, or the system once this work lands.
2. **Context reviewed** — bullet list of documents, files, and prior issues you read. Lets reviewers spot missing inputs.
3. **Constraints and non-goals** — what must hold (compatibility, security, performance) and what this plan deliberately will not do.
4. **Approach** — the chosen path, with a short rationale. If you considered alternatives, name them and why you rejected them.
5. **Work breakdown** — ordered list of child issues. Each child has:
   - Title in imperative form.
   - Owner specialty (Engineer, QA, Designer, Security, DevRel, Manager, etc.).
   - Scope and deliverables.
   - Acceptance criteria.
   - Blocks/blocked-by relationships expressed by phase letter or child title.
6. **Acceptance** — the bar for the parent issue. How the user knows the whole thing is done.
7. **Risks and mitigations** — short list. Skip if there are none.
8. **Deferrals** — what is intentionally pushed to follow-up issues, with why.

## Rules of thumb for splitting

- One child issue, one specialty. If two specialties have to coordinate inside the same issue, split it.
- One child issue, one acceptance verdict. If a reviewer would say "this is half done", split it.
- A child must be checkout-able by the owner from its title and description alone. Reviewers should not have to re-read the parent plan to understand a child.
- Order children by real blocker chains, not by author preference. Parallel children should explicitly say `blockers: none`.
- Avoid `polish` or `cleanup` child issues without acceptance criteria — they never close.

## Filing the plan

Use the Paperclip API to write the plan document, then comment:

- `PUT /api/issues/{issueId}/documents/plan` with the markdown body. If `plan` already exists, include the latest `baseRevisionId`.
- `POST /api/issues/{issueId}/comments` with a short summary that links the plan: `/<prefix>/issues/<issue-id>#document-plan`.
- If approval is required: `POST /api/issues/{issueId}/interactions` with `kind: request_confirmation`, `targetRevisionId` set to the new plan revision, `continuationPolicy: wake_assignee`, and `idempotencyKey: "confirmation:{issueId}:plan:{revisionId}"`.
- Set the issue to `in_review` after creating the confirmation. Stay assigned so the acceptance wakes the planner.

## After plan acceptance

Accepted plan confirmations are not task creation. When the board/user accepts a `request_confirmation` targeting the `plan` document, the next heartbeat must materialize or explicitly block the accepted plan:

1. Fetch the source issue and latest `plan` document, then confirm the accepted revision id from the resolved interaction.
2. `GET /api/issues/{issueId}/accepted-plan-decompositions` and stop if the same revision is already decomposed.
3. Translate the accepted work breakdown into child issues with concrete title, owner/assignee, `projectId`, `goalId`, priority, work mode, acceptance criteria, and blocker relationships.
4. `POST /api/issues/{issueId}/accepted-plan-decompositions` with `acceptedPlanRevisionId` and `children`.
5. For sprint backlog or next-sprint planning, set every child `status` explicitly to `"backlog"` even when the child has an assignee. Assigned children with omitted status default to `"todo"` and will start execution.
6. Use `"todo"` only when the accepted instruction says to begin execution now.
7. Mark the source issue `done` only after readback confirms the decomposition and child issue ids. If materialization is unsafe or missing data, leave the source issue `in_review` or `blocked` with a named blocker; do not close it as merely "plan accepted".

Use the companion skill for deciding issue depth, ownership, dependencies, and parallelization before calling the materialization endpoint. Key requirements covered there: produce a compact task matrix (task, owner, initial status, blockers); encode every hard dependency as `blockedByIssueIds` — parent/child nesting alone does not block execution; and verify the created issue graph before closing the source planning issue.

## Anti-patterns

- Plan disguised as a description edit. Use the `plan` document.
- "Phases A–Z" with no work breakdown inside the phases.
- Children with descriptions that say "see parent" — they fail at delegation time.
- Acceptance written as "code review approval". Reviewers need a behavior bar, not a process bar.
- Plans that bury blocker chains in prose. Use explicit blocked-by lines.
