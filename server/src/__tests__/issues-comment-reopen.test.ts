import { describe, expect, it } from "vitest";
import {
  looksLikeQaFailComment,
  shouldAutoReturnIssueToTodoFromComment,
  shouldWakeAssigneeOnCommentBackToTodo,
} from "../routes/issues-comment-reopen.js";

describe("issues comment reopen helpers", () => {
  it("detects QA-style fail headings", () => {
    expect(looksLikeQaFailComment("## QA FAIL\n\nserializer field missing")).toBe(true);
    expect(looksLikeQaFailComment("## FAIL\n\nsame-lane defect reproduced")).toBe(true);
    expect(looksLikeQaFailComment("## PASS\n\nall green")).toBe(false);
  });

  it("auto-returns in-review agent tasks to todo on QA fail comments from another agent", () => {
    expect(
      shouldAutoReturnIssueToTodoFromComment({
        issueStatus: "in_review",
        issueAssigneeAgentId: "backend-engineer",
        actorType: "agent",
        actorAgentId: "tech-qa",
        body: "## QA FAIL\n\nprovider_booking_rules is missing.",
      }),
    ).toBe(true);
  });

  it("does not auto-return when the assignee comments on their own issue", () => {
    expect(
      shouldAutoReturnIssueToTodoFromComment({
        issueStatus: "in_review",
        issueAssigneeAgentId: "backend-engineer",
        actorType: "agent",
        actorAgentId: "backend-engineer",
        body: "## FAIL\n\nstill investigating.",
      }),
    ).toBe(false);
  });

  it("does not auto-return user comments or non-fail comments", () => {
    expect(
      shouldAutoReturnIssueToTodoFromComment({
        issueStatus: "in_review",
        issueAssigneeAgentId: "backend-engineer",
        actorType: "user",
        actorAgentId: null,
        body: "## QA FAIL\n\nplease fix this.",
      }),
    ).toBe(false);
    expect(
      shouldAutoReturnIssueToTodoFromComment({
        issueStatus: "in_review",
        issueAssigneeAgentId: "backend-engineer",
        actorType: "agent",
        actorAgentId: "tech-qa",
        body: "Need one more screenshot before PASS.",
      }),
    ).toBe(false);
  });

  it("wakes the assignee when a comment-backed status change returns the issue to todo", () => {
    expect(
      shouldWakeAssigneeOnCommentBackToTodo({
        previousStatus: "in_review",
        nextStatus: "todo",
        commentBody: "## QA FAIL\n\nsame-lane defect reproduced.",
        assigneeAgentId: "backend-engineer",
      }),
    ).toBe(true);
    expect(
      shouldWakeAssigneeOnCommentBackToTodo({
        previousStatus: "done",
        nextStatus: "todo",
        commentBody: "## FAIL\n\nregression found after merge.",
        assigneeAgentId: "backend-engineer",
      }),
    ).toBe(true);
  });

  it("does not treat unrelated status changes as comment reopens", () => {
    expect(
      shouldWakeAssigneeOnCommentBackToTodo({
        previousStatus: "blocked",
        nextStatus: "todo",
        commentBody: "Unblocked after dependency merge.",
        assigneeAgentId: "backend-engineer",
      }),
    ).toBe(false);
    expect(
      shouldWakeAssigneeOnCommentBackToTodo({
        previousStatus: "in_review",
        nextStatus: "in_review",
        commentBody: "## QA FAIL\n\nsame-lane defect reproduced.",
        assigneeAgentId: "backend-engineer",
      }),
    ).toBe(false);
  });
});
