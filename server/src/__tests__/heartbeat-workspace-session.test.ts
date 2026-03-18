import { describe, expect, it } from "vitest";
import { resolveDefaultAgentWorkspaceDir } from "../home-paths.js";
import {
  resolveRuntimeSessionParamsForWorkspace,
  shouldAutoResumeDirtyCodeTask,
  shouldEscalateDirtyCodeTaskStall,
  shouldResetTaskSessionForWake,
  shouldResetTaskSessionForTodoCodeCommentWake,
  type ResolvedWorkspaceForRun,
} from "../services/heartbeat.ts";
import type { RealizedExecutionWorkspace } from "../services/workspace-runtime.ts";

function buildResolvedWorkspace(overrides: Partial<ResolvedWorkspaceForRun> = {}): ResolvedWorkspaceForRun {
  return {
    cwd: "/tmp/project",
    source: "project_primary",
    projectId: "project-1",
    workspaceId: "workspace-1",
    repoUrl: null,
    repoRef: null,
    workspaceHints: [],
    warnings: [],
    ...overrides,
  };
}

function buildRealizedWorkspace(
  overrides: Partial<RealizedExecutionWorkspace> = {},
): RealizedExecutionWorkspace {
  return {
    cwd: "/tmp/project/.paperclip/worktrees/codex/BAL-314",
    source: "project_primary",
    projectId: "project-1",
    workspaceId: "workspace-1",
    repoUrl: "git@gitlab.com:balibikehouse/bikehouse-front-v2.git",
    repoRef: "origin/main",
    strategy: "git_worktree",
    branchName: "codex/BAL-314",
    worktreePath: "/tmp/project/.paperclip/worktrees/codex/BAL-314",
    warnings: [],
    created: false,
    ...overrides,
  };
}

describe("resolveRuntimeSessionParamsForWorkspace", () => {
  it("migrates fallback workspace sessions to project workspace when project cwd becomes available", () => {
    const agentId = "agent-123";
    const fallbackCwd = resolveDefaultAgentWorkspaceDir(agentId);

    const result = resolveRuntimeSessionParamsForWorkspace({
      agentId,
      previousSessionParams: {
        sessionId: "session-1",
        cwd: fallbackCwd,
        workspaceId: "workspace-1",
      },
      resolvedWorkspace: buildResolvedWorkspace({ cwd: "/tmp/new-project-cwd" }),
    });

    expect(result.sessionParams).toMatchObject({
      sessionId: "session-1",
      cwd: "/tmp/new-project-cwd",
      workspaceId: "workspace-1",
    });
    expect(result.warning).toContain("Attempting to resume session");
  });

  it("does not migrate when previous session cwd is not the fallback workspace", () => {
    const result = resolveRuntimeSessionParamsForWorkspace({
      agentId: "agent-123",
      previousSessionParams: {
        sessionId: "session-1",
        cwd: "/tmp/some-other-cwd",
        workspaceId: "workspace-1",
      },
      resolvedWorkspace: buildResolvedWorkspace({ cwd: "/tmp/new-project-cwd" }),
    });

    expect(result.sessionParams).toEqual({
      sessionId: "session-1",
      cwd: "/tmp/some-other-cwd",
      workspaceId: "workspace-1",
    });
    expect(result.warning).toBeNull();
  });

  it("does not migrate when resolved workspace id differs from previous session workspace id", () => {
    const agentId = "agent-123";
    const fallbackCwd = resolveDefaultAgentWorkspaceDir(agentId);

    const result = resolveRuntimeSessionParamsForWorkspace({
      agentId,
      previousSessionParams: {
        sessionId: "session-1",
        cwd: fallbackCwd,
        workspaceId: "workspace-1",
      },
      resolvedWorkspace: buildResolvedWorkspace({
        cwd: "/tmp/new-project-cwd",
        workspaceId: "workspace-2",
      }),
    });

    expect(result.sessionParams).toEqual({
      sessionId: "session-1",
      cwd: fallbackCwd,
      workspaceId: "workspace-1",
    });
    expect(result.warning).toBeNull();
  });
});

describe("shouldResetTaskSessionForWake", () => {
  it("resets session context on assignment wake", () => {
    expect(shouldResetTaskSessionForWake({ wakeReason: "issue_assigned" })).toBe(true);
  });

  it("resets session context on timer heartbeats", () => {
    expect(shouldResetTaskSessionForWake({ wakeSource: "timer" })).toBe(true);
  });

  it("resets session context on manual on-demand invokes", () => {
    expect(
      shouldResetTaskSessionForWake({
        wakeSource: "on_demand",
        wakeTriggerDetail: "manual",
      }),
    ).toBe(true);
  });

  it("does not reset session context on mention wake comment", () => {
    expect(
      shouldResetTaskSessionForWake({
        wakeReason: "issue_comment_mentioned",
        wakeCommentId: "comment-1",
      }),
    ).toBe(false);
  });

  it("does not reset session context when commentId is present", () => {
    expect(
      shouldResetTaskSessionForWake({
        wakeReason: "issue_commented",
        commentId: "comment-2",
      }),
    ).toBe(false);
  });

  it("does not reset for comment wakes", () => {
    expect(shouldResetTaskSessionForWake({ wakeReason: "issue_commented" })).toBe(false);
  });

  it("does not reset when wake reason is missing", () => {
    expect(shouldResetTaskSessionForWake({})).toBe(false);
  });

  it("does not reset session context on callback on-demand invokes", () => {
    expect(
      shouldResetTaskSessionForWake({
        wakeSource: "on_demand",
        wakeTriggerDetail: "callback",
      }),
    ).toBe(false);
  });
});

describe("shouldResetTaskSessionForTodoCodeCommentWake", () => {
  it("resets stale code-task sessions for todo comment wakes in project-linked workspaces", () => {
    expect(
      shouldResetTaskSessionForTodoCodeCommentWake({
        wakeReason: "issue_commented",
        issueStatus: "todo",
        executionWorkspaceMode: "isolated",
        hasTaskSession: true,
      }),
    ).toBe(true);
  });

  it("resets stale code-task sessions for reopen comment wakes in project-linked workspaces", () => {
    expect(
      shouldResetTaskSessionForTodoCodeCommentWake({
        wakeReason: "issue_reopened_via_comment",
        issueStatus: "todo",
        executionWorkspaceMode: "project_primary",
        hasTaskSession: true,
      }),
    ).toBe(true);
  });

  it("does not reset in-progress code sessions on ordinary comments", () => {
    expect(
      shouldResetTaskSessionForTodoCodeCommentWake({
        wakeReason: "issue_commented",
        issueStatus: "in_progress",
        executionWorkspaceMode: "isolated",
        hasTaskSession: true,
      }),
    ).toBe(false);
  });

  it("does not reset agent-default tasks just because they were commented", () => {
    expect(
      shouldResetTaskSessionForTodoCodeCommentWake({
        wakeReason: "issue_commented",
        issueStatus: "todo",
        executionWorkspaceMode: "agent_default",
        hasTaskSession: true,
      }),
    ).toBe(false);
  });

  it("does not reset when no saved task session exists", () => {
    expect(
      shouldResetTaskSessionForTodoCodeCommentWake({
        wakeReason: "issue_commented",
        issueStatus: "todo",
        executionWorkspaceMode: "isolated",
        hasTaskSession: false,
      }),
    ).toBe(false);
  });
});

describe("dirty git worktree completion guard", () => {
  it("auto-resumes a successful git worktree issue that is still dirty", () => {
    expect(
      shouldAutoResumeDirtyCodeTask({
        issueStatus: "in_progress",
        issueAssigneeAgentId: "agent-1",
        currentAgentId: "agent-1",
        workspace: buildRealizedWorkspace(),
        worktreeDirty: true,
        autoResumeAttempt: 0,
      }),
    ).toBe(true);
  });

  it("does not auto-resume once the retry limit is exhausted", () => {
    expect(
      shouldAutoResumeDirtyCodeTask({
        issueStatus: "in_progress",
        issueAssigneeAgentId: "agent-1",
        currentAgentId: "agent-1",
        workspace: buildRealizedWorkspace(),
        worktreeDirty: true,
        autoResumeAttempt: 1,
      }),
    ).toBe(false);
  });

  it("does not auto-resume clean worktrees", () => {
    expect(
      shouldAutoResumeDirtyCodeTask({
        issueStatus: "in_progress",
        issueAssigneeAgentId: "agent-1",
        currentAgentId: "agent-1",
        workspace: buildRealizedWorkspace(),
        worktreeDirty: false,
        autoResumeAttempt: 0,
      }),
    ).toBe(false);
  });

  it("escalates only after a dirty task stalls again after the retry", () => {
    expect(
      shouldEscalateDirtyCodeTaskStall({
        issueStatus: "in_progress",
        issueAssigneeAgentId: "agent-1",
        currentAgentId: "agent-1",
        workspace: buildRealizedWorkspace(),
        worktreeDirty: true,
        autoResumeAttempt: 1,
      }),
    ).toBe(true);
  });
});
