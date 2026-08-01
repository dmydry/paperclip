---
name: balibikehouse-native-content-localization
description: Native BaliBikeHouse content and localization execution with exact field scope, human editing, preview gates, and stored readback.
---

# BaliBikeHouse native content and localization

Use this skill to execute an approved content or localization task. Do not use it to invent commercial claims, change product policy, or approve publication.

## Execution contract

Require an exact object locator such as URL, slug, model, or record ID; operation type; source EN; locales; fields and sections to change; fields that must remain unchanged; approval state; preview/readback route; and QA gate. Stop and request a stronger brief if these are ambiguous.

New content defaults to EN first. For locale-routed public records, create the multilingual follow-up after EN publication and production QA unless the brief explicitly declares the record long-term EN-only. Shared browser-visible frontend copy normally covers all supported locales instead.

## Native localization

- Translate meaning, search intent, tone, and customer action; do not translate word-for-word.
- Human-edit every non-English catalog description from the approved EN source.
- Never accept Django admin DeepL or fill-empty output as publishable catalog localization.
- Reject mixed-language fragments, generic filler, unnatural local phrasing, duplicated headings, and invented specifications or promises.
- Preserve stable structured IDs and object relationships; change only the approved localized values.

## Preview, apply, and readback

Use the internal content/translation API as the default write path when the task authorizes execution. Run preview or draft generation first, save the exact proposed field values as a work product, and obtain the required Content QA-QC or Product Owner gate. After approval, apply only the reviewed payload and perform exact stored plus public readback.

After any machine-translation incident, the mandatory path is `draft QA -> approved exact apply -> final readback QA`. Do not collapse those gates.

Keep substantial draft bundles, payloads, diffs, screenshots, and readback evidence in an issue document or work product. Leave a concise linking comment. Never print credentials or authorization tokens.

## Claims

Do not add or alter prices, availability, delivery/pickup guarantees, insurance, deposits, cancellation, or booking promises without explicit Product Owner approval in the issue thread. If approval is missing, name Product Owner as the **routable unblock owner** and state the exact claim decision required.
