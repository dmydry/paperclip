# BaliBikeHouse Paperclip configuration overlay

This directory is the source-owned review surface for the BAL-4296 adaptation
to Paperclip release `2026.609`. It is an overlay for the existing
BaliBikeHouse company, not a company bootstrap package.

Nothing in this directory applies live configuration. The apply boundary is:

`source PR -> merge -> exact source SHA -> validation/dry-run -> owner approval -> API apply -> API readback`

## Review ownership

- Product Owner: `config.json`, the complete 12-agent before/after manifest,
  policy ordering, routine invariants, apply/rollback/readback contract.
- Tech Lead: the three updated workflow skills and the Backend Engineer,
  Frontend Engineer, Tech Lead, and Tech QA-QC bundles.
- Content Lead: the commercial-governance, native-content, and
  communications-intelligence skill contracts, plus the CMO, Content Lead,
  Content Operator, and Communications Manager bundles.
- Content QA-QC: the claims/localization/commercial-quality/AI-pattern QA skill
  and Content QA-QC bundle.

## What changes after an approved apply

- Install the bundled `task-planning`, `qa-acceptance`, and
  `github-pr-workflow` catalog skills.
- Update three existing BAL managed skills from the exact merged source SHA.
- Create four narrow BAL managed skills from the exact merged source SHA.
- Replace all 12 Codex-agent desired skill sets with the `after` arrays in
  `config.json`.
- Materialize the explicit company skill-mutation policy in `config.json`.
- Assert that the three externally sourced routines still use
  `activityGatePolicy: always`; do not change their schedules or descriptions.

Every after-state bundle explicitly retains the canonical
`paperclipai/paperclip/paperclip` coordination skill. The Codex adapter mounts
only explicitly desired skills, so this core runtime capability is a required
baseline in addition to each role's narrow company/catalog bundle.

The company skill-mutation policy covers the eight canonical library mutation
actions only. It does not remove agent runtime use or desired-skill sync access.
Its explicit all-agent deny is evaluated before legacy `skills:create` or
`skills:suggest-changes` compatibility grants, so those grants cannot reopen a
specialist mutation path.

## No-write verification

Run from the repository root:

```sh
python3 ops/company-configs/balibikehouse/validate.py validate
python3 ops/company-configs/balibikehouse/validate.py skill-sync-dry-run
python3 -m unittest discover -s ops/company-configs/balibikehouse -p 'test_*.py'
```

`skill-sync-dry-run` reads only source files. It prints the intended library,
agent-sync, policy, and routine operations and performs no API calls.

## Owner-gated live apply

The owner/operator must bind approval to the exact merged source SHA and then:

1. Read current company skills, all 12 agent skill snapshots, the company skill
   policy revision, and the three routines. Stop on drift from the manifest's
   `before` state or record an updated reviewed baseline.
2. Install the three catalog skills with `POST
   /api/companies/{companyId}/skills/install-catalog` and body
   `{ "catalogSkillId": entry.catalogId }` for each
   `libraryPlan.catalogInstall` entry.
3. For each `libraryPlan.managedUpdate` entry, resolve the existing company
   skill by unique slug and `PATCH
   /api/companies/{companyId}/skills/{skillId}/files` with `path=SKILL.md` and
   the file content from the exact source SHA.
4. Create each `libraryPlan.managedCreate` skill through
   `POST /api/companies/{companyId}/skills`, with `name`, `slug`,
   `description`, and the reviewed `SKILL.md` in `markdown`. Stop if the slug
   already exists with different content.
5. Resolve every after-state skill reference, then replace each agent's set via
   `POST /api/agents/{agentId}/skills/sync`. Read each snapshot back and require
   exact ordered-set equality after canonicalization.
6. `PUT /api/companies/{companyId}/skill-policy` with body
   `{ "expectedRevision": liveRevision, ...policy.apiPayload }`. Before
   applying, evaluate all eight actions for one trusted lead and one specialist
   with `POST /api/companies/{companyId}/skill-policy/evaluate`.
7. Read the three routines and assert title/id match plus
   `activityGatePolicy == "always"`. Do not patch a routine merely to touch it.
8. Read back the policy with `GET /api/companies/{companyId}/skill-policy`, all
   12 desired sets with `GET /api/agents/{agentId}/skills`, all skills with
   `GET /api/companies/{companyId}/skills`, every managed `SKILL.md` with
   `GET /api/companies/{companyId}/skills/{skillId}/files?path=SKILL.md`, and
   the routines with `GET /api/routines/{routineId}`. Require all seven managed
   sources, the three catalog installations, and the three routine invariants
   to match. Store the substantial apply/readback report as an issue document
   or work product and leave only a concise linking comment.

The operator must use the supported Paperclip API/CLI with deterministic
readback. No direct database write or live managed-skill filesystem edit is an
acceptable apply path.

## Rollback

1. Replace each agent's desired set with its `before.desiredSkills` array.
2. If the policy was newly materialized from revision `0`, delete the explicit
   company policy and verify the open default (`revision: 0`,
   `materialized: false`). Otherwise restore the captured pre-apply policy with
   revision-safe replacement.
3. Restore the three updated managed `SKILL.md` files from the pre-apply
   readback artifact.
4. Remove the four newly created managed skills and three catalog installs
   only after confirming no agent still references them. If removal is not
   safe, leave them installed and unattached.
5. Re-read all 12 skill snapshots, the policy, and all three routine
   `activityGatePolicy` values. Routine schedules/descriptions are not part of
   this overlay and must remain unchanged.
6. Revert the source commit in a normal PR if the source contract itself is
   being rolled back.
