import { describe, expect, it } from "vitest";
import { execute } from "../adapters/process/execute.ts";

describe("process adapter execute", () => {
  it("injects run, wake, and auth env for local heartbeat processes", async () => {
    const result = await execute({
      runId: "run-123",
      agent: { id: "agent-123", companyId: "company-123" } as never,
      runtime: {} as never,
      config: {
        command: process.execPath,
        args: [
          "-e",
          [
            "console.log(JSON.stringify({",
            "runId: process.env.PAPERCLIP_RUN_ID,",
            "taskId: process.env.PAPERCLIP_TASK_ID,",
            "wakeReason: process.env.PAPERCLIP_WAKE_REASON,",
            "wakeCommentId: process.env.PAPERCLIP_WAKE_COMMENT_ID,",
            "approvalId: process.env.PAPERCLIP_APPROVAL_ID,",
            "approvalStatus: process.env.PAPERCLIP_APPROVAL_STATUS,",
            "linkedIssueIds: process.env.PAPERCLIP_LINKED_ISSUE_IDS,",
            "agentId: process.env.PAPERCLIP_AGENT_ID,",
            "companyId: process.env.PAPERCLIP_COMPANY_ID,",
            "apiKey: process.env.PAPERCLIP_API_KEY",
            "}));",
          ].join(""),
        ],
      },
      context: {
        taskId: "task-123",
        wakeReason: "issue_assigned",
        wakeCommentId: "comment-123",
        approvalId: "approval-123",
        approvalStatus: "approved",
        issueIds: ["issue-1", "issue-2"],
      },
      onLog: async () => {},
      authToken: "jwt-123",
    });

    expect(result.exitCode).toBe(0);
    const stdout = String(result.resultJson?.stdout ?? "").trim();
    expect(stdout).not.toBe("");
    expect(JSON.parse(stdout)).toEqual({
      runId: "run-123",
      taskId: "task-123",
      wakeReason: "issue_assigned",
      wakeCommentId: "comment-123",
      approvalId: "approval-123",
      approvalStatus: "approved",
      linkedIssueIds: "issue-1,issue-2",
      agentId: "agent-123",
      companyId: "company-123",
      apiKey: "jwt-123",
    });
  });
});
