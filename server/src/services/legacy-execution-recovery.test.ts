import { expect, it } from "vitest";
import { legacyExecutionNeedsReconciliation } from "./legacy-execution-recovery.js";

const stopped = {
  runtimeMode: "legacy", status: "cancelled", errorCode: "cancelled",
  resultJson: {
    executionCancellation: { state: "acknowledged" },
    executionRecovery: { kind: "interrupted", providerStopped: true, sessionPreserved: true, actionOutcomes: "settled" },
  },
};

it("does not require action reconciliation for a proven bootstrap failure", () => {
  const failed = { runtimeMode: "legacy", status: "failed", errorCode: "acpx_session_init_failed" };
  expect(legacyExecutionNeedsReconciliation({ ...failed, resultJson: {
    executionRecovery: { kind: "bootstrap", providerWorkStarted: false },
  } })).toBe(false);
  expect(legacyExecutionNeedsReconciliation({ ...failed, resultJson: {} })).toBe(true);
  expect(legacyExecutionNeedsReconciliation({ ...failed, resultJson: {
    executionRecovery: { kind: "bootstrap", providerWorkStarted: true },
  } })).toBe(true);
});

it("allows a confirmed interrupted checkpoint without treating ordinary cancellation as replay permission", () => {
  expect(legacyExecutionNeedsReconciliation(stopped)).toBe(false);
  expect(legacyExecutionNeedsReconciliation({ ...stopped, resultJson: {} })).toBe(true);
  expect(legacyExecutionNeedsReconciliation({ ...stopped, status: "failed" })).toBe(true);
});

it.each([
  { providerStopped: false }, { sessionPreserved: false }, { actionOutcomes: "unknown" },
])("retains the hold for incomplete interruption evidence: %j", (missing) => {
  expect(legacyExecutionNeedsReconciliation({ ...stopped, resultJson: {
    ...stopped.resultJson,
    executionRecovery: { ...stopped.resultJson.executionRecovery, ...missing },
  } })).toBe(true);
});

it("retains the hold until the provider actually acknowledges cancellation", () => {
  expect(legacyExecutionNeedsReconciliation({ ...stopped, resultJson: {
    ...stopped.resultJson, executionCancellation: { state: "requested" },
  } })).toBe(true);
});

const gated = {
  runtimeMode: "legacy", status: "cancelled", errorCode: "issue_continuation_waiting_on_review",
  resultJson: {
    stopReason: "issue_continuation_waiting_on_review", timeoutSource: "stale_queued_run_gate",
    executionRecovery: { kind: "pre_dispatch", source: "stale_queued_run_gate", providerWorkStarted: false },
  },
};

it("does not turn a proven pre-dispatch gate into an ambiguous provider interruption", () => {
  expect(legacyExecutionNeedsReconciliation(gated)).toBe(false);
});

it.each([
  { kind: "bootstrap_unknown" }, { source: "adapter" }, { providerWorkStarted: true },
])("keeps unknown or started work guarded despite a gate error code: %j", (missing) => {
  expect(legacyExecutionNeedsReconciliation({ ...gated, resultJson: {
    ...gated.resultJson, executionRecovery: { ...gated.resultJson.executionRecovery, ...missing },
  } })).toBe(true);
});

it("does not infer safe cancellation from a name, absent start timestamp, or inconsistent result", () => {
  expect(legacyExecutionNeedsReconciliation({ ...gated, resultJson: {} })).toBe(true);
  expect(legacyExecutionNeedsReconciliation({ ...gated, status: "failed" })).toBe(true);
  expect(legacyExecutionNeedsReconciliation({ ...gated, errorCode: "provider_failed" })).toBe(true);
  expect(legacyExecutionNeedsReconciliation({ ...gated, scheduledRetryAttempt: 1 })).toBe(true);
});
