---
name: balibikehouse-communications-intelligence
description: Use when Communications Manager analyzes approved respond.io or bounded communications exports and must produce deterministic evidence, dedupe, and routed follow-ups.
---

# BaliBikeHouse communications intelligence

Use this skill for read-only analysis of approved respond.io exports or other bounded communications evidence. It turns deterministic export inputs into durable findings and executor-ready routed follow-ups without expanding the Communications Manager into an execution or approval role.

## Input contract

Require the exact export or work-product locator, source timestamp, time window and timezone, export schema, filters, business question, and privacy/redaction boundary. Record stable conversation, contact, message, or export identifiers only where they are needed to reproduce a finding. Never expose credentials, raw authorization material, or unnecessary customer personal data.

Validate the deterministic export before analysis: capture row and conversation counts, required fields, timestamp bounds, duplicate-key rules, exclusions, and malformed or missing records. Separate measured facts from interpretation and state any evidence limitation that could change the decision.

## Analysis and dedupe

- Group repeated sales, support, booking, availability, pricing, delivery, trust, and policy friction by a documented deterministic rule.
- Quantify each material pattern and retain the smallest sufficient evidence sample with stable source identifiers.
- Dedupe against open issues, issue documents, and work products using source identifiers, time windows, and evidence fingerprints. Update an existing live follow-up when it already covers the same finding instead of creating a duplicate.
- Record a no-action decision when the export does not show a material or reproducible gap.

## Evidence and routed follow-ups

Store substantial analysis in an issue document or work product. The artifact must name the export locator and timestamp, method, counts, dedupe result, findings, evidence limitations, and recommended owner. Leave only a concise issue comment linking the evidence and stating the decision.

Frame routed follow-ups with the business objective, exact owner, source evidence, affected surface, deliverable, verification path, out of scope, and downstream decision condition. Route product/backlog decisions to Product Owner, content briefs to Content Lead, deeper measurement to Data Analyst, and unresolved technical framing to Tech Lead. Do not publish an execution task when the evidence is not strong enough to support a bounded contract.

## Authority exclusions

This skill does not authorize direct customer communication, respond.io writes, CMS execution, content publication, or independent editorial QA authority. It does not approve copy, localization, commercial claims, prices, deposits, insurance, cancellation, availability, delivery/pickup, or booking expectations. Route those actions and verdicts to their canonical owners.
