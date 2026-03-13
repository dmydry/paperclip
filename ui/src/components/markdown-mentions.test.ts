import { describe, expect, it } from "vitest";
import { applyMention, type MentionLike } from "./markdown-mentions";

describe("applyMention", () => {
  it("replaces the latest agent mention query with the full agent name", () => {
    const option: MentionLike = { name: "Marketing Engineer", kind: "agent" };

    expect(applyMention("Ping @Mark", "Mark", option)).toBe("Ping @Marketing Engineer ");
  });

  it("replaces the latest mention occurrence when multiple @ tokens exist", () => {
    const option: MentionLike = { name: "CMO", kind: "agent" };

    expect(applyMention("@CEO and @CM", "CM", option)).toBe("@CEO and @CMO ");
  });
});
