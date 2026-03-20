type CommentActorType = "agent" | "user";

type AutoReturnToTodoInput = {
  issueStatus: string | null | undefined;
  issueAssigneeAgentId: string | null | undefined;
  actorType: CommentActorType;
  actorAgentId: string | null | undefined;
  body: string | null | undefined;
};

type CommentBackToTodoWakeInput = {
  previousStatus: string | null | undefined;
  nextStatus: string | null | undefined;
  commentBody: string | null | undefined;
  assigneeAgentId: string | null | undefined;
};

const QA_FAIL_COMMENT_HEADING = /^\s*##\s*(?:QA\s+)?FAIL\b/im;
const AUTO_RETURN_TO_TODO_STATUSES = new Set(["in_review", "done"]);
const COMMENT_WAKE_BACK_TO_TODO_STATUSES = new Set(["in_review", "done", "cancelled"]);

function hasCommentBody(body: string | null | undefined) {
  return typeof body === "string" && body.trim().length > 0;
}

export function looksLikeQaFailComment(body: string | null | undefined): boolean {
  const normalized = typeof body === "string" ? body.trim() : "";
  if (!normalized) return false;
  return QA_FAIL_COMMENT_HEADING.test(normalized);
}

export function shouldAutoReturnIssueToTodoFromComment(input: AutoReturnToTodoInput): boolean {
  if (input.actorType !== "agent") return false;
  if (!input.issueAssigneeAgentId) return false;
  if (!AUTO_RETURN_TO_TODO_STATUSES.has(input.issueStatus ?? "")) return false;
  if (!looksLikeQaFailComment(input.body)) return false;
  return input.actorAgentId !== input.issueAssigneeAgentId;
}

export function shouldWakeAssigneeOnCommentBackToTodo(input: CommentBackToTodoWakeInput): boolean {
  if (!input.assigneeAgentId) return false;
  if (!hasCommentBody(input.commentBody)) return false;
  if (input.nextStatus !== "todo") return false;
  return COMMENT_WAKE_BACK_TO_TODO_STATUSES.has(input.previousStatus ?? "");
}
