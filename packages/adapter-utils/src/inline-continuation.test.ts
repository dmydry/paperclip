import { describe, expect, it } from "vitest";
import type { ExecutionContinuationEnvelope } from "@paperclipai/shared";
import { inlineContinuationMessages } from "./inline-continuation.js";
import { renderPaperclipWakePrompt } from "./server-utils.js";

type Message = ExecutionContinuationEnvelope["messages"][number];
const message = (index: number, body: string): Message => ({
  id: `comment-${index}`, body, authorType: "agent", authorId: "agent-1",
  createdByRunId: "old-run", createdAt: "2026-09-12T00:00:00Z",
  updatedAt: "2026-09-12T00:00:00Z", deleted: false, sourceTrust: null,
});

describe("bounded inline continuation", () => {
  it("leaves small histories and verified deltas unchanged", () => {
    const messages = [message(1, "current request")];
    expect(inlineContinuationMessages(messages, []).messages).toBe(messages);
    expect(inlineContinuationMessages(messages, []).omittedMessageIds).toEqual([]);
  });

  it("bounds a SIN-1506-sized history without changing durable source data", () => {
    const messages = Array.from({ length: 219 }, (_, i) => message(i, "history ".repeat(650)));
    messages[0] = { ...messages[0]!, body: "originating owner decision", authorType: "user", createdByRunId: null };
    messages[218] = { ...messages[218]!, body: "latest owner direction", authorType: "user", createdByRunId: null };
    const before = JSON.stringify(messages);
    const result = inlineContinuationMessages(messages, ["comment-0"]);
    expect(JSON.stringify(result.messages).length).toBeLessThanOrEqual(256_000);
    expect(result.messages.map((m) => m.id)).toEqual(messages.map((m) => m.id));
    expect(result.messages[0]).toEqual(messages[0]);
    expect(result.messages[218]).toEqual(messages[218]);
    expect(result.omittedMessageIds.length).toBeGreaterThan(0);
    expect(JSON.stringify(messages)).toBe(before);
  });

  it("marks an oversized origin explicitly and preserves deletion and trust metadata", () => {
    const messages = [message(1, "<".repeat(300_000)), { ...message(2, ""), deleted: true }];
    const result = inlineContinuationMessages(messages, ["comment-1"]);
    expect(result.messages[0]).toEqual({ ...messages[0], body: null, bodyOmitted: true });
    expect(result.messages[1]).toEqual(messages[1]);
    expect(result.omittedMessageIds).toEqual(["comment-1"]);
  });

  it("renders explicit retrieval pointers below ACP's hard input limit", () => {
    const messages = Array.from({ length: 219 }, (_, i) => message(i, "<history> ".repeat(650)));
    const wake = { reason: "issue_commented", executionContinuation: {
      version: 1, issueId: "issue-uuid", companyId: "company-uuid",
      originCommentIds: ["comment-218"], messages, objective: "Continue accepted PR",
      coverage: { kind: "task_history_snapshot" }, completedActions: [{ operationId: "already-completed" }],
      interactionOutcomes: [{ id: "accepted-approval", status: "accepted" }], completedWork: "saved commits",
    } };
    const prompt = renderPaperclipWakePrompt(wake);
    expect(prompt.length).toBeLessThan(300_000);
    expect(prompt).toContain("NOT complete message-body coverage");
    expect(prompt).toContain("GET /api/issues/{issueId}/comments/{id}");
    expect(prompt).toContain('"inlineComplete":false');
    expect(prompt).toContain("accepted-approval");
    expect(prompt).toContain("already-completed");
    expect(prompt).not.toContain("This snapshot includes the complete authorized task history");
  });
});
