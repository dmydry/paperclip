import { describe, expect, it } from "vitest";
import { applyMention, type MentionLike } from "./markdown-mentions";

describe("applyMention", () => {
  it("replaces the latest agent mention query with an explicit agent mention link", () => {
    const option: MentionLike = {
      name: "Marketing Engineer",
      kind: "agent",
      agentId: "agent-1",
      agentIcon: "wrench",
    };

    expect(applyMention("Ping @Mark", "Mark", option)).toBe(
      "Ping [@Marketing Engineer](agent://agent-1?i=wrench) ",
    );
  });

  it("keeps user mentions as plain text", () => {
    const option: MentionLike = { name: "Dmitry", kind: "user" };

    expect(applyMention("@CEO and @Dm", "Dm", option)).toBe("@CEO and @Dmitry ");
  });
});
