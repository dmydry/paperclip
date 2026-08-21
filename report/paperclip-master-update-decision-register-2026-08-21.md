# Paperclip master update decision register — Gate A proposal

Date: 2026-08-21 (Asia/Makassar)

Gate A status: approved by owner for D01–D22. The approval authorized one isolated candidate only; it did not authorize push or any live apply.

| ID | Surface | Proposed decision | Candidate acceptance criterion |
|---|---|---|---|
| D01 | Input refs | Use only `dev=a0ed84d24d1e75c6c199bba9a31c9c3f66c31fca` and `master=733ffbf7c3e24942138d1d610494d7b22945918c` | Candidate ancestry and report record both full SHAs |
| D02 | Migration collision | Keep custom heartbeat indexes, content-preserving rename `0197` → `0227` | Live-backup restore recognizes `0227` by hash; upstream `0197…0226` apply once |
| D03 | Authorization | Rebase the narrow run-comment behavior, not the old whole file | Standard run can comment on its own issue and valid parent; unrelated issue writes remain contained; low-trust tests pass |
| D04 | Accepted plans | Keep cross-project child workspace selection and retry fingerprint normalization | Target-project child uses its own primary workspace; retry with a new run id does not duplicate or 409 |
| D05 | Recovery | Reconcile, do not blindly retain, because upstream already contains part of the loop fix | Source-scoped recovery cannot recursively create handoffs; attempts are bounded; standing sprint containers are not recovered as stranded |
| D06 | Built-in agents | Keep local auto-provision feature gate | With built-ins disabled, creating/reconciling SIN/BAL produces no Summarizer/Reflection Coach agent or hire approval |
| D07 | Codex subscription 2 | Keep `codex_subscription_2_local` and separate auth home | Both subscription lanes pass environment test and one bounded smoke run; subscription 2 never inherits host `OPENAI_API_KEY` |
| D08 | Agent model routing | Preserve current SIN/BAL Sol/Terra xhigh assignments and switch-script defaults | Post-candidate config readback matches pre-release manifest; no implicit cheap-profile downgrade |
| D09 | Instructions security | Keep managed-bundle-only agent writes | Board can update configured paths; agent can update managed bundle files only; external/legacy paths remain denied |
| D10 | BAL project ops | Keep `ops/company-configs/balibikehouse/**` and its seven role skills | Validator passes and source remains installable; no generated live sync during Phase 2 |
| D11 | OpenCode | Keep upstream core adapter/support; keep Paper-01 usage retired | Adapter remains registered/testable; no OpenCode agents, homes or service usage are recreated |
| D12 | Generated catalogs | Regenerate from reconciled sources | Catalog generation is clean and no hand-edited generated diff remains |
| D13 | Test harness | Prefer upstream runner/sharding, then restore only local stability requirements still reproduced | General and serialized suites pass without disabling tests |
| D14 | Onboarding/chat UI | Accept upstream chat-first default and reconcile only local required behavior | Build and focused onboarding/task-detail tests pass; no unwanted built-in hire approvals |
| D15 | Decisions/Activity/secrets | Accept upstream core features | Routes/UI build and focused smoke pass; no automatic policy/config enablement beyond upstream defaults |
| D16 | Interaction resolver default | Accept upstream `anyone` default for new interactions, preserving company/run/auth boundaries | Existing pending policies migrate conservatively; cross-company and unauthorized resolver tests pass |
| D17 | Multi-project workspace sync | Accept upstream default and preserve project-local accepted-plan children | Mentioned-project staging and accepted-plan tests both pass |
| D18 | Managed CLI lifecycle | Defer adoption; keep current source checkout + systemd release path | Candidate builds/runs under current Paper-01 unit; no install-store/service migration |
| D19 | Tailscale runtime HTTPS | Keep upstream `auto`; do not install/force broker in core release | Absence of broker does not break current runtime start; pilot is a later task |
| D20 | Experimental features | Keep current/default-off state for Apps/Connections, status cards, Simplified English, Daytona duplex and similar experiments | Pre/post settings manifest shows no accidental enablement |
| D21 | Skills/workflows | Source release first; live SIN/BAL instruction/project-skill sync is a separate post-release approval | Release does not mutate agent instructions; follow-up audit uses new chat/Decisions/workspace contracts |
| D22 | Release mechanics | One candidate, one Gate B, one production apply | Exact tested candidate SHA is fast-forwarded; no extra reconciliation branch or stacked release PR |

## Conflict manifest

The isolated merge forecast reports these 28 content conflicts:

1. `cli/src/__tests__/onboard.test.ts`
2. `packages/db/src/migrations/meta/_journal.json`
3. `packages/db/src/status-card-migrations.test.ts`
4. `packages/skills-catalog/generated/catalog.json`
5. `scripts/run-vitest-stable.mjs`
6. `server/src/__tests__/built-in-agents.test.ts`
7. `server/src/__tests__/companies-service.test.ts`
8. `server/src/__tests__/heartbeat-workspace-session.test.ts`
9. `server/src/__tests__/issue-agent-mutation-ownership-routes.test.ts`
10. `server/src/__tests__/issue-comment-reopen-routes.test.ts`
11. `server/src/adapters/registry.ts`
12. `server/src/index.ts`
13. `server/src/onboarding-assets/ceo/AGENTS.md`
14. `server/src/onboarding-assets/default/AGENTS.md`
15. `server/src/routes/issues.ts`
16. `server/src/services/authorization.ts`
17. `server/src/services/built-in-agents.ts`
18. `server/src/services/heartbeat.ts`
19. `server/src/services/issues.ts`
20. `server/src/services/recovery/service.ts`
21. `server/src/services/recovery/successful-run-handoff.ts`
22. `server/src/services/workspace-runtime.ts`
23. `server/vitest.config.ts`
24. `skills/paperclip/SKILL.md`
25. `skills/paperclip/references/api-reference.md`
26. `ui/src/App.cases-routing.test.tsx`
27. `ui/src/components/OnboardingWizard.tsx`
28. `ui/src/pages/IssueDetail.tsx`

## Recorded Gate A approval scope

Recommended approval:

> Gate A approved for the exact `origin/dev` and `origin/master` SHAs recorded above, the 2026-08-21 review and migration review, and decision rows D01–D22. This authorizes creation and testing of one isolated reconciliation candidate only. It does not authorize push to `dev`, live migrations, service restart, timer changes, or live agent instruction/config sync.
