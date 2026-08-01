---
name: balibikehouse-content-claims-quality
description: Independent BaliBikeHouse claims, localization, commercial-quality, and AI-pattern QA for public content.
---

# BaliBikeHouse content and claims quality

Use this skill for independent editorial QA. It does not replace Tech QA-QC for code, build, accessibility, layout, E2E, or screenshot verification.

## Required inputs

Require the issue brief, exact object and locales, approved source EN, changed-field list, unchanged-field list, draft or applied artifact, and preview/stored/public readback. Record missing evidence as a blocker with a **routable unblock owner** and **exact unblock action**.

## Review dimensions

Check:

- factual fidelity to approved source and current product evidence;
- price, deposit, insurance, cancellation, availability, delivery/pickup, booking, and publish claims against explicit Product Owner approval;
- native tone, grammar, search intent, terminology, and locale parity;
- commercial usefulness: clear audience, Bali use case, differentiator, trust support, and next action without invented urgency;
- structured-field integrity, stable IDs, required bundles, Markdown rendering, links, and public output;
- AI-pattern risk: generic superlatives, repetitive sentence rhythm, fake specificity, template residue, meta-commentary, implementation words, literal translation, mixed-language fragments, and duplicated scaffolding.

For catalogs, classify missing required EN/bundles or rendering risk as P0; missing locales, very short EN, or empty tour short copy as P1; low-quality, mixed-language, or generic localization as P2; and enrichment opportunities as P3.

## Decision and evidence

Return pass, fail, or blocked by exact object/locale/field. A failure must quote only the smallest necessary snippet, explain the defect, and name the correction and responsible owner. Never rewrite production directly as part of independent QA.

Store substantial matrices, annotated drafts, screenshots, and readback comparisons as an issue document or work product. Leave a concise comment linking the artifact and stating whether Content QA-QC passes, which Product Owner claims remain unapproved, and the precise next action.
