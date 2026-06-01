# Paperclip migration review, 2026-06-01

## Scope

New SQL migrations in the master update:

- `0090_resource_memberships.sql`
- `0091_old_swarm.sql`
- `0092_mighty_puma.sql`
- `0093_giant_green_goblin.sql`

## 0090 Resource memberships

Adds:

- `agent_memberships`
- `project_memberships`
- FK constraints to `companies`, `agents`, `projects`
- lookup and uniqueness indexes by company/user/resource

Risk:

- Low to medium. Additive tables and indexes.
- No broad backfill or destructive DML.
- Index creation can take a short lock, but tables are new and empty on migration.

Operational relevance:

- Enables user-specific project/agent membership controls and sidebar filtering.

## 0091 Document annotations

Adds:

- `document_annotation_threads`
- `document_annotation_comments`
- `document_annotation_anchor_snapshots`
- FKs to companies/issues/documents/revisions/agents/runs
- B-tree indexes for company/document/issue/status lookups
- GIN trigram index on annotation comment body

Risk:

- Medium. Mostly additive, but more FK surfaces touch issue/document deletion paths.
- The GIN trigram index depends on existing trigram support already present from previous migrations.
- No existing data rewrite.

Operational relevance:

- Enables anchored review comments on issue documents, including remap snapshots across revisions.

## 0092 Plan decomposition exact-once

Adds:

- `issue_plan_decompositions`
- FK constraints to company, source issue, accepted plan revision, accepted interaction, owner agent/run
- unique index on company/source issue/accepted plan revision
- active owner lookup index

Risk:

- Low to medium. Additive table, no data rewrite.
- Main behavior risk is semantic: duplicate accepted plan decomposition should now be blocked/guarded.

Operational relevance:

- Protects owner-approved plan decomposition from duplicate child issue creation.

## 0093 Workspace cascade constraints

Changes:

- Drops and recreates `execution_workspaces_company_id_companies_id_fk`.
- Drops and recreates `workspace_operations_company_id_companies_id_fk`.
- New FK behavior is `ON DELETE cascade`.

Risk:

- Medium. This is the only non-additive migration in the set.
- It changes company deletion behavior for execution workspace and workspace operation rows.
- Paper-01 company deletion is not part of normal operations, but this is still a real lifecycle-contract change.

Operational relevance:

- Cleanup behavior becomes more consistent when a company is deleted.

## Live release notes

- Backup live DB before applying.
- Expect pending migrations `0090..0093`.
- Smoke should explicitly verify:
  - migration status has no pending migrations
  - document annotations tables exist
  - resource membership tables exist
  - issue plan decomposition table exists
  - workspace FK constraints apply cleanly

