---
name: balibikehouse-commercial-governance
description: Planning, briefing, approval, and commercial-claim governance for BaliBikeHouse leaders and product/content owners.
---

# BaliBikeHouse commercial governance

Use this skill for portfolio planning, briefs, approvals, and decisions that may change customer expectations. It does not authorize live configuration, content publication, pricing changes, or code execution.

## Plan and brief

- Start from current board, production, repository, analytics, and evidence state; old planning comments are context, not inventory.
- Define the business objective, why now, exact lane owner, deliverable, verification, out of scope, sprint or learning-loop contribution, and follow-up condition.
- Keep work narrow enough for one accountable executor. Split cross-repository implementation and separate content planning, execution, and QA.
- When an accepted plan contains multiple tasks, consult and update its decomposition history. Reuse stable item identifiers and existing child links; create only missing issues.

## Approval boundaries

Product Owner or a board user must approve changes to prices, deposits, insurance, cancellation, availability promises, delivery/pickup promises, booking expectations, or publication/release decisions. Routine drafting and QA do not imply approval.

Content Lead owns the content brief and source-copy contract. Content Operator executes approved fields. Content QA-QC independently reviews public copy, localization, claims, commercial quality, and AI-pattern risk. Tech QA-QC owns code/build/layout/E2E evidence, not editorial quality.

## Blockers and evidence

Every blocker must name a **routable unblock owner** and an **exact unblock action**, along with checked evidence and the readback that resumes work. Do not route production permission or data-fix actions to engineering after the code path has been cleared.

Store substantial plans, comparative analysis, approval matrices, and QA evidence as issue documents or work products. Leave a concise decision comment with the artifact link, decision, responsible next owner, and condition.

## Guardrails

- Do not create automatic approval chains or auto-generated QA filler.
- Do not expand a sprint merely because a new capability exists.
- Do not expose internal bike-group or child-unit fulfillment mechanics without an explicit board product decision.
- Do not infer external production changes from Paperclip company activity; routines that monitor external systems must retain their explicit run policy.
