import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { agents, companies, createDb, heartbeatRunEvents, heartbeatRuns } from "@paperclipai/db";
import { getEmbeddedPostgresTestSupport, startEmbeddedPostgresTestDatabase } from "../__tests__/helpers/embedded-postgres.js";
import { legacyExecutionNeedsReconciliation, legacyExecutionNeedsReconciliationWithEvidence } from "./legacy-execution-recovery.js";

const support = await getEmbeddedPostgresTestSupport();
describe.skipIf(!support.supported)("server-owned pre-dispatch cancellation proof", () => {
  let database: Awaited<ReturnType<typeof startEmbeddedPostgresTestDatabase>>;
  let db: ReturnType<typeof createDb>;
  beforeAll(async () => {
    database = await startEmbeddedPostgresTestDatabase("pre-dispatch-cancellation-");
    db = createDb(database.connectionString);
  }, 60_000);
  afterAll(async () => { await db?.$client.end(); await database?.cleanup(); });

  async function fixture(errorCode = "issue_dependencies_blocked", patch: Partial<typeof heartbeatRuns.$inferInsert> = {}) {
    const companyId = randomUUID(), agentId = randomUUID();
    await db.insert(companies).values({ id: companyId, name: "Gate proof", issuePrefix: "G" + companyId.replaceAll("-", "") });
    await db.insert(agents).values({ id: agentId, companyId, name: "Worker", adapterType: "process", status: "paused" });
    return (await db.insert(heartbeatRuns).values({ companyId, agentId, runtimeMode: "legacy", status: "cancelled",
      finishedAt: new Date(), errorCode, resultJson: {
        stopReason: errorCode, timeoutSource: "stale_queued_run_gate",
        executionRecovery: { kind: "pre_dispatch", source: "stale_queued_run_gate", providerWorkStarted: false },
      }, ...patch,
    }).returning())[0]!;
  }

  it.each([
    "issue_dependencies_blocked", "issue_paused", "issue_terminal_status", "issue_assignee_changed", "issue_execution_lock_changed",
  ])("retains the no-provider wait for %s, including a claimed running row", async errorCode => {
    for (const claimed of [false, true]) {
      const run = await fixture(errorCode, claimed ? { startedAt: new Date(), runtimeModeResolvedAt: new Date() } : {});
      expect(legacyExecutionNeedsReconciliation(run)).toBe(true);
      expect(await legacyExecutionNeedsReconciliationWithEvidence(db, run)).toBe(false);
      await db.insert(heartbeatRunEvents).values({ companyId: run.companyId, agentId: run.agentId, runId: run.id, seq: 1, eventType: "adapter.invoke" });
      expect(await legacyExecutionNeedsReconciliationWithEvidence(db, run)).toBe(true);
    }
  });

  it.each([
    { scheduledRetryAttempt: 1 }, { processPid: 1234 }, { sessionIdAfter: "provider-session" },
    { resultJson: { stopReason: "issue_dependencies_blocked", timeoutSource: "stale_queued_run_gate",
      executionRecovery: { kind: "pre_dispatch", source: "stale_queued_run_gate", providerWorkStarted: true } } },
    { resultJson: { stopReason: "issue_dependencies_blocked", timeoutSource: "stale_queued_run_gate",
      executionRecovery: { kind: "pre_dispatch", source: "untrusted-receipt", providerWorkStarted: false } } },
    { resultJson: { stopReason: "issue_dependencies_blocked", timeoutSource: "stale_queued_run_gate", workspaceRestoreFailure: "restore_unsafe_archive",
      executionRecovery: { kind: "pre_dispatch", source: "stale_queued_run_gate", providerWorkStarted: false } } },
  ])("holds conflicting or incomplete dispatch/restore evidence: %j", async patch => {
    const run = await fixture("issue_dependencies_blocked", patch);
    expect(await legacyExecutionNeedsReconciliationWithEvidence(db, run)).toBe(true);
  });
});
