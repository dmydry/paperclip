---
name: balibikehouse-code-task-templates
description: Executor-ready BaliBikeHouse code-task framing with exact surfaces, verification, review gates, and follow-up conditions.
---

# BaliBikeHouse code task templates

Use this skill when shaping or refining code work. A task is ready only when an executor can start without inventing the product or technical contract.

## Required issue contract

State all of the following:

- business objective and why now;
- exact executor and exact project: `Bikehouse Front` or `Bikehouse API`;
- one execution repository and the likely files, modules, pages, endpoints, or tests;
- exact deliverable and expected user-visible or operator-visible result;
- source evidence from current board, production, repository, and test state;
- explicit out of scope;
- exact verification commands and known `@flow:*`, `@vertical`, `@smoke`, `@regression`, or `@seo` coverage;
- relevant repository `AGENTS.md` and `docs/architecture/*` reading contract;
- likely docs update, or `Docs: likely no update` with a reason;
- downstream condition: what opens next if QA passes, if a material gap appears, or if no gap exists;
- review gates: Tech QA-QC for code; Content QA-QC for changed public copy, SEO/GEO answers, FAQs, structured editorial fields, or locale files; Product Owner only for commercial claims, terms, booking expectations, availability logic, or publish/release approval.

For browser-visible work, also name placement, visual priority, what remains dominant, one to three reference surfaces, desktop/mobile expectations, screenshot evidence, approved EN copy or drafting authority, exact locales, and anti-goals. High-intent entry surfaces keep one primary commercial action unless the board explicitly approves a different product contract.

## Decomposition and blockers

For an accepted multi-task plan, read and update the decomposition history. Reuse the plan's stable item identifiers, link existing children, and create only missing execution issues. Do not duplicate work because a conversion run was retried.

If the task is blocked, name the **routable unblock owner**, the **exact unblock action**, the checked evidence, and the readback or verification condition that resumes execution.

## Evidence and asynchronous gates

Put substantial planning, QA, screenshot, or release evidence in an issue document or work product. Use a concise comment to link the artifact and state the decision.

When local verification is complete but hosted CI is asynchronous, record and hand off the **exact PR/MR head** plus the pending check set. **Do not poll CI in a heartbeat.** Any new push requires a new exact-head handoff and invalidates the prior CI association.

## Cross-repository work

Keep the business outcome in a coordinating parent, but create one project-linked child per repository. Each child must independently satisfy this template and define its contract boundary with the other child.
