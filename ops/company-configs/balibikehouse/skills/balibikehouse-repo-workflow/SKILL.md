---
name: balibikehouse-repo-workflow
description: Safe repository selection, project linkage, isolated worktrees, review evidence, and exact-head CI handoff for BaliBikeHouse code work.
---

# BaliBikeHouse repository workflow

Use this skill for BaliBikeHouse code planning, execution, review, and follow-up.

## Repository and project contract

- Attach frontend work to `Bikehouse Front` and backend/API work to `Bikehouse API`.
- Use one execution repository per issue. Split cross-repository delivery into linked child issues under one coordinating parent.
- Work from an issue-scoped branch and isolated worktree created from the current remote base. Do not execute from a durable main clone.
- Read the repository-local `AGENTS.md` and the relevant `docs/architecture/*` contracts before changing code.
- Preserve unrelated working-tree changes. Never rewrite or discard another contributor's work.

## Blocked work

When execution cannot proceed, write a first-class blocker that names the **routable unblock owner** and the **exact unblock action**. Include the evidence already checked, the condition that will prove the blocker cleared, and the issue that should resume. A generic statement such as "waiting for access" is not sufficient.

Permission grants, credential replacement, production admin toggles, and direct live-data repair go to the operator or owner who can perform that action. Route to an engineer only while a code or API-contract defect remains plausible.

## Accepted-plan decomposition

Before creating children from an accepted multi-task plan, read the parent's decomposition history and linked issues. Reuse the accepted plan item identifiers, map each item to an existing child when one already exists, and create only the missing children. Record the resulting item-to-issue mapping on the parent so a later retry is idempotent.

## Evidence and review

Keep status comments concise. Store substantial design, implementation, QA, or release evidence as an issue document or work product and link it from the comment. The artifact should identify the source branch and commit, commands run, result, unresolved risk, and reviewer gate.

For browser-visible copy or locale changes, require both Tech QA-QC and Content QA-QC. Product Owner approval is reserved for changed commercial claims, prices, terms, booking expectations, availability logic, or a publish/release decision.

## Pull request and asynchronous CI handoff

- Push the branch and identify the **exact PR/MR head** commit from the hosting service.
- Run the relevant local checks before handoff and record their results in the work product.
- If CI is still running, hand off the persisted wait/review state at that exact head. **Do not poll CI in a heartbeat or consume a run waiting for an asynchronous result.**
- A new push invalidates prior pending or passed CI evidence. Re-read the PR/MR head and create a fresh exact-head handoff.
- Merge or release only through the repository's normal review gate. Never infer a CI result from elapsed time or company activity.

## Completion

Leave the issue in the state that reflects reality: in review while an exact-head review or CI gate is outstanding, done only when the requested source result and evidence exist, or blocked with the owner/action contract above.
