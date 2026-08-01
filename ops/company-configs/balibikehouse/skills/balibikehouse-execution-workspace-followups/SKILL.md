---
name: balibikehouse-execution-workspace-followups
description: Continue BaliBikeHouse execution safely in an existing issue workspace, including persisted blockers, evidence artifacts, and exact-head review waits.
---

# BaliBikeHouse execution workspace follow-ups

Use this skill when a technical issue continues an existing repository branch, worktree, pull request, or review state.

## Resume from durable state

1. Read the current issue, the latest relevant comment, linked work products/documents, and the issue's workspace metadata.
2. Confirm the repository, branch, current commit, dirty state, and pull-request association before changing anything.
3. Reuse the issue workspace when it is safe and current. Do not create a second branch or duplicate issue merely because a later run resumed the work.
4. Compare the current source state with the last recorded artifact and execute only the remaining contract.

If a workspace is missing, conflicted, or unsafe to reuse, leave a blocker naming the **routable unblock owner** and **exact unblock action**, plus the readback that allows continuation. Do not hide workspace loss behind a generic implementation blocker.

## Plans and follow-up issues

When continuing an accepted multi-task plan, consult the parent decomposition history and existing linked children first. Preserve stable plan item identifiers and create only missing issues. Append the mapping when it changes so retries remain idempotent.

## Evidence placement

Store substantial code review, QA, screenshot, or release evidence as an issue document or work product. A status comment should contain only the concise outcome, artifact link, current source commit, and next gate.

## Asynchronous CI and review

- Read the hosting service's **exact PR/MR head** before handing off CI or review.
- Record the exact head, PR/MR URL, local verification, pending checks, and required reviewer in the durable artifact.
- **Do not poll CI in a heartbeat or spend a run waiting for an asynchronous result.** Leave the issue in the appropriate persisted in-review/wait state.
- If the branch advances, discard the association with the old check run and create a new exact-head handoff.
- On a later wake, read the current head once and compare it with the artifact before accepting any result.

## Finish or block

Finish only when the issue contract and its verification are complete. Otherwise preserve the workspace and name one concrete next action, owner, and resume condition.
