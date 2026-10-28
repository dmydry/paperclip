<!-- GENERATED FILE — DO NOT EDIT. Run pnpm generate:capability-inventory. -->

# Capability Capability Contract

This generated contract is a self-contained derivative of the Paperclip skill, its seven references, the Paperclip Evals corpus, and the legacy MCP tool surface. It does not import or contact the Paperclip control plane.

The skill/reference inventory and eval cases are the only normative behavior sources. Paperclip does not use the legacy MCP calls as a production capability surface; all MCP names below are traceability aliases folded into normative eval rows. Their disposition, grants, assertions, and evidence contract are inherited from the target row rather than classified independently.

## Baseline Counts

- Skill/reference headings: 167
- Eval cases: 106 across 16 groups
- Total normative rows: 273
- Legacy MCP aliases folded into normative rows: 42

| Eval group | Cases |
| --- | ---: |
| hb | 5 |
| co | 6 |
| st | 8 |
| cm | 6 |
| se | 4 |
| su | 4 |
| bl | 5 |
| dp | 3 |
| ix | 9 |
| ap | 6 |
| ar | 4 |
| er | 9 |
| rf | 22 |
| mh | 4 |
| rs | 3 |
| wk | 8 |

## Regeneration

- `pnpm --dir packages/paperclip-runner generate:capability-inventory` imports the canonical baselines and rewrites every generated file.
- `pnpm --dir packages/paperclip-runner check:capability-inventory` validates counts, uniqueness, normative dispositions, one-to-one MCP folds, required fields, and generated-file drift without requiring the external eval repository.

## Skill / Reference Rows

| Capability | Primary disposition | Source anchor |
| --- | --- | --- |
| skill:skills/paperclip/SKILL.md:paperclip-skill:10 | optional_agent_tool | skills/paperclip/SKILL.md:10 |
| skill:skills/paperclip/SKILL.md:terminology:14 | optional_agent_tool | skills/paperclip/SKILL.md:14 |
| skill:skills/paperclip/SKILL.md:authentication:20 | control_plane_owned | skills/paperclip/SKILL.md:20 |
| skill:skills/paperclip/SKILL.md:authenticated-deployment-and-board-user-mode:32 | optional_agent_tool | skills/paperclip/SKILL.md:32 |
| skill:skills/paperclip/SKILL.md:conversation-tasks:61 | optional_agent_tool | skills/paperclip/SKILL.md:61 |
| skill:skills/paperclip/SKILL.md:server-verified-external-chat-turns:78 | control_plane_owned | skills/paperclip/SKILL.md:78 |
| skill:skills/paperclip/SKILL.md:the-heartbeat-procedure:118 | optional_agent_tool | skills/paperclip/SKILL.md:118 |
| skill:skills/paperclip/SKILL.md:generated-artifacts-and-work-products:246 | always_agent_tool | skills/paperclip/SKILL.md:246 |
| skill:skills/paperclip/SKILL.md:status-quick-guide:311 | control_plane_owned | skills/paperclip/SKILL.md:311 |
| skill:skills/paperclip/SKILL.md:monitors-and-watchers-say-only-what-you-actually-scheduled:335 | optional_agent_tool | skills/paperclip/SKILL.md:335 |
| skill:skills/paperclip/SKILL.md:delegating-review-tasks:348 | always_agent_tool | skills/paperclip/SKILL.md:348 |
| skill:skills/paperclip/SKILL.md:managing-a-user-s-inbox:359 | control_plane_owned | skills/paperclip/SKILL.md:359 |
| skill:skills/paperclip/SKILL.md:issue-dependencies-blockers:367 | control_plane_owned | skills/paperclip/SKILL.md:367 |
| skill:skills/paperclip/SKILL.md:requesting-board-approval:401 | optional_agent_tool | skills/paperclip/SKILL.md:401 |
| skill:skills/paperclip/SKILL.md:issue-thread-interactions:422 | optional_agent_tool | skills/paperclip/SKILL.md:422 |
| skill:skills/paperclip/SKILL.md:standalone-decisions:452 | optional_agent_tool | skills/paperclip/SKILL.md:452 |
| skill:skills/paperclip/SKILL.md:mcp-tool-approval-gates:556 | optional_agent_tool | skills/paperclip/SKILL.md:556 |
| skill:skills/paperclip/SKILL.md:niche-workflow-pointers:598 | optional_agent_tool | skills/paperclip/SKILL.md:598 |
| skill:skills/paperclip/SKILL.md:cases:608 | optional_agent_tool | skills/paperclip/SKILL.md:608 |
| skill:skills/paperclip/SKILL.md:company-skills-workflow:613 | optional_agent_tool | skills/paperclip/SKILL.md:613 |
| skill:skills/paperclip/SKILL.md:routines:624 | optional_agent_tool | skills/paperclip/SKILL.md:624 |
| skill:skills/paperclip/SKILL.md:task-files-and-workspace-choices:635 | optional_agent_tool | skills/paperclip/SKILL.md:635 |
| skill:skills/paperclip/SKILL.md:issue-workspace-runtime-controls:643 | optional_agent_tool | skills/paperclip/SKILL.md:643 |
| skill:skills/paperclip/SKILL.md:proposing-credentials-safely:650 | optional_agent_tool | skills/paperclip/SKILL.md:650 |
| skill:skills/paperclip/SKILL.md:reading-granted-secrets:657 | optional_agent_tool | skills/paperclip/SKILL.md:657 |
| skill:skills/paperclip/SKILL.md:critical-rules:683 | optional_agent_tool | skills/paperclip/SKILL.md:683 |
| skill:skills/paperclip/SKILL.md:comment-style-required:710 | always_agent_tool | skills/paperclip/SKILL.md:710 |
| skill:skills/paperclip/SKILL.md:update:758 | optional_agent_tool | skills/paperclip/SKILL.md:758 |
| skill:skills/paperclip/SKILL.md:task-documents-and-deliverables:768 | always_agent_tool | skills/paperclip/SKILL.md:768 |
| skill:skills/paperclip/SKILL.md:planning-required-when-planning-requested:782 | optional_agent_tool | skills/paperclip/SKILL.md:782 |
| skill:skills/paperclip/SKILL.md:key-endpoints-hot-routes:813 | optional_agent_tool | skills/paperclip/SKILL.md:813 |
| skill:skills/paperclip/SKILL.md:searching-issues:843 | optional_agent_tool | skills/paperclip/SKILL.md:843 |
| skill:skills/paperclip/SKILL.md:full-reference:853 | optional_agent_tool | skills/paperclip/SKILL.md:853 |
| skill:skills/paperclip/SKILL.md:conversational-confirmation-answers:857 | always_agent_tool | skills/paperclip/SKILL.md:857 |
| skill:skills/paperclip/SKILL.md:incidental-feedback:874 | optional_agent_tool | skills/paperclip/SKILL.md:874 |
| skill:skills/paperclip/references/api-reference.md:paperclip-api-reference:1 | optional_agent_tool | skills/paperclip/references/api-reference.md:1 |
| skill:skills/paperclip/references/api-reference.md:response-schemas:9 | optional_agent_tool | skills/paperclip/references/api-reference.md:9 |
| skill:skills/paperclip/references/api-reference.md:agent-record-get-api-agents-me-or-get-api-agents-agentid:11 | optional_agent_tool | skills/paperclip/references/api-reference.md:11 |
| skill:skills/paperclip/references/api-reference.md:company-portability:44 | optional_agent_tool | skills/paperclip/references/api-reference.md:44 |
| skill:skills/paperclip/references/api-reference.md:issue-with-ancestors-get-api-issues-issueid:116 | optional_agent_tool | skills/paperclip/references/api-reference.md:116 |
| skill:skills/paperclip/references/api-reference.md:issue-update-response-patch-api-issues-issueid:202 | optional_agent_tool | skills/paperclip/references/api-reference.md:202 |
| skill:skills/paperclip/references/api-reference.md:blocker-diagnostics-get-api-issues-issueid-diagnostics-blockers:252 | control_plane_owned | skills/paperclip/references/api-reference.md:252 |
| skill:skills/paperclip/references/api-reference.md:wake-diagnostics-get-api-issues-issueid-diagnostics-wakes:291 | control_plane_owned | skills/paperclip/references/api-reference.md:291 |
| skill:skills/paperclip/references/api-reference.md:subtree-diagnostics-get-api-issues-issueid-diagnostics-subtree:335 | optional_agent_tool | skills/paperclip/references/api-reference.md:335 |
| skill:skills/paperclip/references/api-reference.md:execution-policy-fields-on-an-issue:383 | optional_agent_tool | skills/paperclip/references/api-reference.md:383 |
| skill:skills/paperclip/references/api-reference.md:cross-agent-review-gates:435 | always_agent_tool | skills/paperclip/references/api-reference.md:435 |
| skill:skills/paperclip/references/api-reference.md:worked-example-ic-heartbeat:468 | optional_agent_tool | skills/paperclip/references/api-reference.md:468 |
| skill:skills/paperclip/references/api-reference.md:1-identity-skip-if-already-in-context:473 | control_plane_owned | skills/paperclip/references/api-reference.md:473 |
| skill:skills/paperclip/references/api-reference.md:2-check-inbox:477 | control_plane_owned | skills/paperclip/references/api-reference.md:477 |
| skill:skills/paperclip/references/api-reference.md:3-already-have-issue-101-inprogress-highest-priority-continue-it:484 | optional_agent_tool | skills/paperclip/references/api-reference.md:484 |
| skill:skills/paperclip/references/api-reference.md:4-do-the-actual-work-write-code-run-tests:491 | optional_agent_tool | skills/paperclip/references/api-reference.md:491 |
| skill:skills/paperclip/references/api-reference.md:5-work-is-done-update-status-and-comment-in-one-call:493 | always_agent_tool | skills/paperclip/references/api-reference.md:493 |
| skill:skills/paperclip/references/api-reference.md:6-still-have-time-checkout-the-next-task:497 | control_plane_owned | skills/paperclip/references/api-reference.md:497 |
| skill:skills/paperclip/references/api-reference.md:7-made-partial-progress-not-done-yet-comment-and-exit:504 | always_agent_tool | skills/paperclip/references/api-reference.md:504 |
| skill:skills/paperclip/references/api-reference.md:worked-example-report-a-board-user-s-mine-inbox:509 | control_plane_owned | skills/paperclip/references/api-reference.md:509 |
| skill:skills/paperclip/references/api-reference.md:board-user-created-the-requesting-issue:514 | optional_agent_tool | skills/paperclip/references/api-reference.md:514 |
| skill:skills/paperclip/references/api-reference.md:fetch-the-board-user-s-mine-inbox-issues:518 | control_plane_owned | skills/paperclip/references/api-reference.md:518 |
| skill:skills/paperclip/references/api-reference.md:summarize-it-back-to-the-board-in-a-comment-or-document:532 | always_agent_tool | skills/paperclip/references/api-reference.md:532 |
| skill:skills/paperclip/references/api-reference.md:worked-example-archive-a-resolved-inbox-item:537 | control_plane_owned | skills/paperclip/references/api-reference.md:537 |
| skill:skills/paperclip/references/api-reference.md:the-responsible-user-s-id-is-resolved-from-the-authenticated-agent-run:542 | optional_agent_tool | skills/paperclip/references/api-reference.md:542 |
| skill:skills/paperclip/references/api-reference.md:reverse-the-archive-if-it-was-premature-or-no-longer-desired:551 | optional_agent_tool | skills/paperclip/references/api-reference.md:551 |
| skill:skills/paperclip/references/api-reference.md:worked-example-reviewer-approver-heartbeat:561 | always_agent_tool | skills/paperclip/references/api-reference.md:561 |
| skill:skills/paperclip/references/api-reference.md:worked-example-manager-heartbeat:600 | optional_agent_tool | skills/paperclip/references/api-reference.md:600 |
| skill:skills/paperclip/references/api-reference.md:1-identity-skip-if-already-in-context:603 | control_plane_owned | skills/paperclip/references/api-reference.md:603 |
| skill:skills/paperclip/references/api-reference.md:2-check-team-status:607 | optional_agent_tool | skills/paperclip/references/api-reference.md:607 |
| skill:skills/paperclip/references/api-reference.md:3-agent-42-is-blocked-read-comments:614 | control_plane_owned | skills/paperclip/references/api-reference.md:614 |
| skill:skills/paperclip/references/api-reference.md:4-unblock-reassign-and-comment:618 | control_plane_owned | skills/paperclip/references/api-reference.md:618 |
| skill:skills/paperclip/references/api-reference.md:5-check-own-assignments:622 | optional_agent_tool | skills/paperclip/references/api-reference.md:622 |
| skill:skills/paperclip/references/api-reference.md:6-create-subtasks-and-delegate:629 | optional_agent_tool | skills/paperclip/references/api-reference.md:629 |
| skill:skills/paperclip/references/api-reference.md:load-tests-depend-on-caching-layer-being-done-first-paperclip-will-auto-wake-agent-55-when-the-blocker-resolves:635 | control_plane_owned | skills/paperclip/references/api-reference.md:635 |
| skill:skills/paperclip/references/api-reference.md:7-dashboard-for-health-check:640 | optional_agent_tool | skills/paperclip/references/api-reference.md:640 |
| skill:skills/paperclip/references/api-reference.md:comments-and-mentions:646 | always_agent_tool | skills/paperclip/references/api-reference.md:646 |
| skill:skills/paperclip/references/api-reference.md:update:653 | optional_agent_tool | skills/paperclip/references/api-reference.md:653 |
| skill:skills/paperclip/references/api-reference.md:cross-team-work-and-delegation:675 | optional_agent_tool | skills/paperclip/references/api-reference.md:675 |
| skill:skills/paperclip/references/api-reference.md:receiving-cross-team-work:679 | optional_agent_tool | skills/paperclip/references/api-reference.md:679 |
| skill:skills/paperclip/references/api-reference.md:questions-and-dependencies:691 | always_agent_tool | skills/paperclip/references/api-reference.md:691 |
| skill:skills/paperclip/references/api-reference.md:company-context:703 | optional_agent_tool | skills/paperclip/references/api-reference.md:703 |
| skill:skills/paperclip/references/api-reference.md:company-branding-ceo-board:715 | optional_agent_tool | skills/paperclip/references/api-reference.md:715 |
| skill:skills/paperclip/references/api-reference.md:openclaw-invite-prompt-ceo:735 | optional_agent_tool | skills/paperclip/references/api-reference.md:735 |
| skill:skills/paperclip/references/api-reference.md:setting-agent-instructions-path:754 | optional_agent_tool | skills/paperclip/references/api-reference.md:754 |
| skill:skills/paperclip/references/api-reference.md:project-setup-create-workspace:787 | optional_agent_tool | skills/paperclip/references/api-reference.md:787 |
| skill:skills/paperclip/references/api-reference.md:option-a-one-call-create-with-workspace:811 | optional_agent_tool | skills/paperclip/references/api-reference.md:811 |
| skill:skills/paperclip/references/api-reference.md:option-b-two-calls-project-first-then-workspace:830 | optional_agent_tool | skills/paperclip/references/api-reference.md:830 |
| skill:skills/paperclip/references/api-reference.md:governance-and-approvals:859 | optional_agent_tool | skills/paperclip/references/api-reference.md:859 |
| skill:skills/paperclip/references/api-reference.md:requesting-a-hire-management-only:863 | optional_agent_tool | skills/paperclip/references/api-reference.md:863 |
| skill:skills/paperclip/references/api-reference.md:ceo-strategy-approval:928 | optional_agent_tool | skills/paperclip/references/api-reference.md:928 |
| skill:skills/paperclip/references/api-reference.md:questions-and-waiting-for-human-input:937 | always_agent_tool | skills/paperclip/references/api-reference.md:937 |
| skill:skills/paperclip/references/api-reference.md:issue-thread-confirmations:1041 | always_agent_tool | skills/paperclip/references/api-reference.md:1041 |
| skill:skills/paperclip/references/api-reference.md:conversational-confirmation-answers:1100 | always_agent_tool | skills/paperclip/references/api-reference.md:1100 |
| skill:skills/paperclip/references/api-reference.md:checkbox-confirmations:1106 | always_agent_tool | skills/paperclip/references/api-reference.md:1106 |
| skill:skills/paperclip/references/api-reference.md:item-verdict-requests:1221 | optional_agent_tool | skills/paperclip/references/api-reference.md:1221 |
| skill:skills/paperclip/references/api-reference.md:checking-approval-status:1331 | optional_agent_tool | skills/paperclip/references/api-reference.md:1331 |
| skill:skills/paperclip/references/api-reference.md:approval-follow-up-requesting-agent:1337 | always_agent_tool | skills/paperclip/references/api-reference.md:1337 |
| skill:skills/paperclip/references/api-reference.md:issue-lifecycle:1355 | always_agent_tool | skills/paperclip/references/api-reference.md:1355 |
| skill:skills/paperclip/references/api-reference.md:error-handling:1387 | control_plane_owned | skills/paperclip/references/api-reference.md:1387 |
| skill:skills/paperclip/references/api-reference.md:full-api-reference:1407 | optional_agent_tool | skills/paperclip/references/api-reference.md:1407 |
| skill:skills/paperclip/references/api-reference.md:agents:1409 | optional_agent_tool | skills/paperclip/references/api-reference.md:1409 |
| skill:skills/paperclip/references/api-reference.md:issues-tasks:1430 | optional_agent_tool | skills/paperclip/references/api-reference.md:1430 |
| skill:skills/paperclip/references/api-reference.md:companies-projects-goals:1471 | optional_agent_tool | skills/paperclip/references/api-reference.md:1471 |
| skill:skills/paperclip/references/api-reference.md:routines:1495 | optional_agent_tool | skills/paperclip/references/api-reference.md:1495 |
| skill:skills/paperclip/references/api-reference.md:approvals-costs-activity-dashboard:1511 | optional_agent_tool | skills/paperclip/references/api-reference.md:1511 |
| skill:skills/paperclip/references/api-reference.md:secrets:1533 | optional_agent_tool | skills/paperclip/references/api-reference.md:1533 |
| skill:skills/paperclip/references/api-reference.md:agent-secret-proposals:1546 | optional_agent_tool | skills/paperclip/references/api-reference.md:1546 |
| skill:skills/paperclip/references/api-reference.md:agent-secret-access:1646 | optional_agent_tool | skills/paperclip/references/api-reference.md:1646 |
| skill:skills/paperclip/references/api-reference.md:common-mistakes:1686 | optional_agent_tool | skills/paperclip/references/api-reference.md:1686 |
| skill:skills/paperclip/references/artifacts.md:generated-artifacts-and-work-products:1 | always_agent_tool | skills/paperclip/references/artifacts.md:1 |
| skill:skills/paperclip/references/artifacts.md:workspace-only-file-references:15 | optional_agent_tool | skills/paperclip/references/artifacts.md:15 |
| skill:skills/paperclip/references/cases.md:cases:1 | optional_agent_tool | skills/paperclip/references/cases.md:1 |
| skill:skills/paperclip/references/cases.md:core-model:43 | optional_agent_tool | skills/paperclip/references/cases.md:43 |
| skill:skills/paperclip/references/cases.md:upsert-semantics:62 | optional_agent_tool | skills/paperclip/references/cases.md:62 |
| skill:skills/paperclip/references/cases.md:start-and-hand-off-work:100 | optional_agent_tool | skills/paperclip/references/cases.md:100 |
| skill:skills/paperclip/references/cases.md:example-factory-instructions:249 | optional_agent_tool | skills/paperclip/references/cases.md:249 |
| skill:skills/paperclip/references/cases.md:read-and-search:272 | optional_agent_tool | skills/paperclip/references/cases.md:272 |
| skill:skills/paperclip/references/cases.md:task-documents-and-legacy-case-documents:355 | always_agent_tool | skills/paperclip/references/cases.md:355 |
| skill:skills/paperclip/references/cases.md:fields:389 | optional_agent_tool | skills/paperclip/references/cases.md:389 |
| skill:skills/paperclip/references/cases.md:issue-links:422 | optional_agent_tool | skills/paperclip/references/cases.md:422 |
| skill:skills/paperclip/references/cases.md:child-cases:447 | optional_agent_tool | skills/paperclip/references/cases.md:447 |
| skill:skills/paperclip/references/cases.md:attachments:466 | optional_agent_tool | skills/paperclip/references/cases.md:466 |
| skill:skills/paperclip/references/cases.md:lifecycle:479 | optional_agent_tool | skills/paperclip/references/cases.md:479 |
| skill:skills/paperclip/references/cases.md:worked-blog-post-example:493 | optional_agent_tool | skills/paperclip/references/cases.md:493 |
| skill:skills/paperclip/references/company-skills.md:company-skills-workflow:1 | optional_agent_tool | skills/paperclip/references/company-skills.md:1 |
| skill:skills/paperclip/references/company-skills.md:what-exists:5 | optional_agent_tool | skills/paperclip/references/company-skills.md:5 |
| skill:skills/paperclip/references/company-skills.md:permission-model:22 | optional_agent_tool | skills/paperclip/references/company-skills.md:22 |
| skill:skills/paperclip/references/company-skills.md:core-endpoints:29 | optional_agent_tool | skills/paperclip/references/company-skills.md:29 |
| skill:skills/paperclip/references/company-skills.md:install-a-skill-into-the-company:65 | optional_agent_tool | skills/paperclip/references/company-skills.md:65 |
| skill:skills/paperclip/references/company-skills.md:app-shipped-catalog:75 | optional_agent_tool | skills/paperclip/references/company-skills.md:75 |
| skill:skills/paperclip/references/company-skills.md:external-source-import:101 | optional_agent_tool | skills/paperclip/references/company-skills.md:101 |
| skill:skills/paperclip/references/company-skills.md:source-types-in-order-of-preference:105 | optional_agent_tool | skills/paperclip/references/company-skills.md:105 |
| skill:skills/paperclip/references/company-skills.md:example-skills-sh-import-preferred:116 | optional_agent_tool | skills/paperclip/references/company-skills.md:116 |
| skill:skills/paperclip/references/company-skills.md:example-github-import:138 | optional_agent_tool | skills/paperclip/references/company-skills.md:138 |
| skill:skills/paperclip/references/company-skills.md:inspect-what-was-installed:164 | optional_agent_tool | skills/paperclip/references/company-skills.md:164 |
| skill:skills/paperclip/references/company-skills.md:assign-skills-to-an-existing-agent:181 | optional_agent_tool | skills/paperclip/references/company-skills.md:181 |
| skill:skills/paperclip/references/company-skills.md:include-skills-during-hire-or-create:216 | optional_agent_tool | skills/paperclip/references/company-skills.md:216 |
| skill:skills/paperclip/references/company-skills.md:notes:256 | optional_agent_tool | skills/paperclip/references/company-skills.md:256 |
| skill:skills/paperclip/references/issue-documents.md:issue-documents-through-the-api:1 | always_agent_tool | skills/paperclip/references/issue-documents.md:1 |
| skill:skills/paperclip/references/issue-documents.md:create-a-document:8 | always_agent_tool | skills/paperclip/references/issue-documents.md:8 |
| skill:skills/paperclip/references/issue-documents.md:update-or-resolve-an-unclear-write:49 | optional_agent_tool | skills/paperclip/references/issue-documents.md:49 |
| skill:skills/paperclip/references/issue-workspaces.md:issue-workspace-runtime-controls:1 | optional_agent_tool | skills/paperclip/references/issue-workspaces.md:1 |
| skill:skills/paperclip/references/issue-workspaces.md:discover-the-workspace:5 | optional_agent_tool | skills/paperclip/references/issue-workspaces.md:5 |
| skill:skills/paperclip/references/issue-workspaces.md:choose-files-and-repositories:23 | optional_agent_tool | skills/paperclip/references/issue-workspaces.md:23 |
| skill:skills/paperclip/references/issue-workspaces.md:control-services:37 | optional_agent_tool | skills/paperclip/references/issue-workspaces.md:37 |
| skill:skills/paperclip/references/issue-workspaces.md:start-all-configured-services-waits-for-configured-readiness-checks:42 | optional_agent_tool | skills/paperclip/references/issue-workspaces.md:42 |
| skill:skills/paperclip/references/issue-workspaces.md:restart-all-configured-services:50 | optional_agent_tool | skills/paperclip/references/issue-workspaces.md:50 |
| skill:skills/paperclip/references/issue-workspaces.md:stop-all-running-services:58 | optional_agent_tool | skills/paperclip/references/issue-workspaces.md:58 |
| skill:skills/paperclip/references/issue-workspaces.md:read-the-url:77 | optional_agent_tool | skills/paperclip/references/issue-workspaces.md:77 |
| skill:skills/paperclip/references/issue-workspaces.md:mcp-tools:86 | optional_agent_tool | skills/paperclip/references/issue-workspaces.md:86 |
| skill:skills/paperclip/references/routines.md:paperclip-routines:1 | optional_agent_tool | skills/paperclip/references/routines.md:1 |
| skill:skills/paperclip/references/routines.md:lifecycle:16 | optional_agent_tool | skills/paperclip/references/routines.md:16 |
| skill:skills/paperclip/references/routines.md:creating-a-routine:27 | optional_agent_tool | skills/paperclip/references/routines.md:27 |
| skill:skills/paperclip/references/routines.md:concurrency-policies:64 | optional_agent_tool | skills/paperclip/references/routines.md:64 |
| skill:skills/paperclip/references/routines.md:catch-up-policies:76 | optional_agent_tool | skills/paperclip/references/routines.md:76 |
| skill:skills/paperclip/references/routines.md:activity-gated-scheduled-runs:87 | optional_agent_tool | skills/paperclip/references/routines.md:87 |
| skill:skills/paperclip/references/routines.md:example-skip-quiet-nights:107 | optional_agent_tool | skills/paperclip/references/routines.md:107 |
| skill:skills/paperclip/references/routines.md:adding-triggers:126 | optional_agent_tool | skills/paperclip/references/routines.md:126 |
| skill:skills/paperclip/references/routines.md:schedule-cron:136 | optional_agent_tool | skills/paperclip/references/routines.md:136 |
| skill:skills/paperclip/references/routines.md:webhook:150 | optional_agent_tool | skills/paperclip/references/routines.md:150 |
| skill:skills/paperclip/references/routines.md:api-manual-only:167 | optional_agent_tool | skills/paperclip/references/routines.md:167 |
| skill:skills/paperclip/references/routines.md:updating-and-deleting-triggers:179 | optional_agent_tool | skills/paperclip/references/routines.md:179 |
| skill:skills/paperclip/references/routines.md:manual-run:196 | optional_agent_tool | skills/paperclip/references/routines.md:196 |
| skill:skills/paperclip/references/routines.md:updating-a-routine:212 | optional_agent_tool | skills/paperclip/references/routines.md:212 |
| skill:skills/paperclip/references/routines.md:reading-routines-and-runs:223 | optional_agent_tool | skills/paperclip/references/routines.md:223 |
| skill:skills/paperclip/references/workflows.md:paperclip-workflow-playbooks:1 | optional_agent_tool | skills/paperclip/references/workflows.md:1 |
| skill:skills/paperclip/references/workflows.md:project-setup-ceo-manager:7 | optional_agent_tool | skills/paperclip/references/workflows.md:7 |
| skill:skills/paperclip/references/workflows.md:openclaw-invite-ceo:22 | optional_agent_tool | skills/paperclip/references/workflows.md:22 |
| skill:skills/paperclip/references/workflows.md:setting-agent-instructions-path:50 | optional_agent_tool | skills/paperclip/references/workflows.md:50 |
| skill:skills/paperclip/references/workflows.md:company-import-export:79 | optional_agent_tool | skills/paperclip/references/workflows.md:79 |
| skill:skills/paperclip/references/workflows.md:self-test-playbook-app-level:106 | optional_agent_tool | skills/paperclip/references/workflows.md:106 |

## Legacy MCP Alias Index

This is a compatibility/traceability index, not a tool catalog. “Inherited disposition” is shown only to make the normative target easy to audit.

| Legacy MCP name | Folded into normative row | Inherited disposition | Source anchor |
| --- | --- | --- | --- |
| paperclipMe | eval:hb-inbox-lite-01 | control_plane_owned | packages/mcp-server/src/tools.ts:290 |
| paperclipInboxLite | eval:hb-inbox-lite-01 | control_plane_owned | packages/mcp-server/src/tools.ts:296 |
| paperclipListAgents | eval:rf-api-mgr-heartbeat-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:302 |
| paperclipListSkills | eval:rf-cskill-audit-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:308 |
| paperclipGetAgent | eval:rf-api-mgr-heartbeat-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:314 |
| paperclipListIssues | eval:se-q-filters-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:323 |
| paperclipGetIssue | eval:se-get-issue-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:338 |
| paperclipGetHeartbeatContext | eval:hb-context-01 | control_plane_owned | packages/mcp-server/src/tools.ts:344 |
| paperclipListComments | eval:se-get-issue-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:353 |
| paperclipGetComment | eval:hb-wake-comment-01 | control_plane_owned | packages/mcp-server/src/tools.ts:366 |
| paperclipListIssueApprovals | eval:ap-board-approval-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:373 |
| paperclipListDocuments | eval:dp-base-revision-01 | always_agent_tool | packages/mcp-server/src/tools.ts:379 |
| paperclipGetDocument | eval:dp-base-revision-01 | always_agent_tool | packages/mcp-server/src/tools.ts:385 |
| paperclipListDocumentRevisions | eval:dp-base-revision-01 | always_agent_tool | packages/mcp-server/src/tools.ts:392 |
| paperclipListProjects | eval:rf-wf-project-setup-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:402 |
| paperclipGetProject | eval:rf-wf-project-setup-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:408 |
| paperclipGetIssueWorkspaceRuntime | eval:rf-iws-start-url-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:417 |
| paperclipControlIssueWorkspaceServices | eval:rf-iws-start-url-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:423 |
| paperclipWaitForIssueWorkspaceService | eval:rf-iws-target-restart-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:440 |
| paperclipListGoals | eval:su-parent-goal-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:466 |
| paperclipGetGoal | eval:su-parent-goal-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:472 |
| paperclipListApprovals | eval:ap-approval-wake-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:478 |
| paperclipCreateApproval | eval:ap-board-approval-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:487 |
| paperclipGetApproval | eval:ap-approval-wake-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:496 |
| paperclipGetApprovalIssues | eval:ap-approval-wake-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:502 |
| paperclipListApprovalComments | eval:ap-approval-deny-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:508 |
| paperclipCreateIssue | eval:su-parent-goal-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:514 |
| paperclipUpdateIssue | eval:st-done-comment-01 | always_agent_tool | packages/mcp-server/src/tools.ts:521 |
| paperclipCheckoutIssue | eval:co-body-contract-01 | control_plane_owned | packages/mcp-server/src/tools.ts:528 |
| paperclipReleaseIssue | eval:er-release-01 | control_plane_owned | packages/mcp-server/src/tools.ts:540 |
| paperclipAddComment | eval:cm-multiline-01 | always_agent_tool | packages/mcp-server/src/tools.ts:546 |
| paperclipSuggestTasks | eval:ix-suggest-tasks-01 | always_agent_tool | packages/mcp-server/src/tools.ts:553 |
| paperclipAskUserQuestions | eval:ix-questions-01 | always_agent_tool | packages/mcp-server/src/tools.ts:565 |
| paperclipRequestConfirmation | eval:ix-confirmation-plan-01 | always_agent_tool | packages/mcp-server/src/tools.ts:577 |
| paperclipRequestCheckboxConfirmation | eval:ix-checkbox-01 | always_agent_tool | packages/mcp-server/src/tools.ts:589 |
| paperclipUpsertIssueDocument | eval:dp-plan-doc-01 | always_agent_tool | packages/mcp-server/src/tools.ts:601 |
| paperclipRestoreIssueDocumentRevision | eval:dp-base-revision-01 | always_agent_tool | packages/mcp-server/src/tools.ts:612 |
| paperclipLinkIssueApproval | eval:ap-board-approval-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:627 |
| paperclipUnlinkIssueApproval | eval:ap-board-approval-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:636 |
| paperclipApprovalDecision | eval:ap-approval-wake-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:646 |
| paperclipAddApprovalComment | eval:ap-approval-deny-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:668 |
| paperclipApiRequest | eval:rf-api-404-report-01 | optional_agent_tool | packages/mcp-server/src/tools.ts:677 |
