import type { ExecutionContinuationEnvelope } from "@paperclipai/shared";

// Leave room for instructions, task scope and action receipts below the Codex
// ACP input ceiling (1,048,576 characters). This bounds only the inline view;
// the durable envelope and source comments are never rewritten.
const INLINE_HISTORY_CHAR_BUDGET = 256_000;
type Message = ExecutionContinuationEnvelope["messages"][number];
type InlineMessage = Omit<Message, "body"> & { body: string | null; bodyOmitted?: true };

function encodedLength(value: unknown): number {
  return JSON.stringify(value).replace(/[<>]/g, "\\u003c").length;
}

export function inlineContinuationMessages(
  messages: Message[] = [],
  originCommentIds: string[] = [],
): { messages: InlineMessage[]; omittedMessageIds: string[] } {
  if (encodedLength(messages) <= INLINE_HISTORY_CHAR_BUDGET) {
    return { messages, omittedMessageIds: [] };
  }
  const inline: InlineMessage[] = messages.map((message) => message.deleted
    ? message
    : { ...message, body: null, bodyOmitted: true });
  let remaining = INLINE_HISTORY_CHAR_BUDGET - encodedLength(inline);
  const origins = new Set(originCommentIds);
  const latestUser = messages.findLastIndex((message) =>
    message.authorType === "user" && !message.deleted && !message.createdByRunId);
  // Preserve exact wake requests and the latest human direction before older
  // history, then fill newest-first. Output stays in original chronology.
  const priority = messages.map((_, index) => index).sort((a, b) =>
    Number(origins.has(messages[b]!.id) || b === latestUser)
      - Number(origins.has(messages[a]!.id) || a === latestUser) || b - a);
  for (const index of priority) {
    const message = messages[index]!;
    if (message.deleted) continue;
    const cost = encodedLength(message) - encodedLength(inline[index]);
    if (cost > remaining) continue;
    inline[index] = message;
    remaining -= cost;
  }
  return {
    messages: inline,
    omittedMessageIds: inline.filter((message) => message.bodyOmitted).map((message) => message.id),
  };
}
