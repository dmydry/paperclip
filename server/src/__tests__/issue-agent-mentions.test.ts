import { describe, expect, it } from "vitest";
import { findMentionedAgentIdsInBody } from "../services/issues.ts";

describe("findMentionedAgentIdsInBody", () => {
  const agents = [
    { id: "agent-1", name: "Marketing Engineer" },
    { id: "agent-2", name: "CMO" },
    { id: "agent-3", name: "Content QA / Localization Guard" },
  ];

  it("matches agent names with spaces", () => {
    expect(
      findMentionedAgentIdsInBody("@Marketing Engineer please take this.", agents),
    ).toEqual(["agent-1"]);
  });

  it("matches agent names with punctuation and slashes", () => {
    expect(
      findMentionedAgentIdsInBody(
        "Need review from @Content QA / Localization Guard before ship.",
        agents,
      ),
    ).toEqual(["agent-3"]);
  });

  it("does not match partial prefixes", () => {
    expect(
      findMentionedAgentIdsInBody("@Marketing Engineers should not match the singular agent.", agents),
    ).toEqual([]);
  });
});
