import { describe, expect, it } from "vitest";
import { renderPaperclipWakePrompt, stringifyPaperclipWakePayload } from "./server-utils.js";

const wake = (body: string) => ({
  reason: "issue_commented",
  executionContinuation: { version: 1, messages: [{ body }] },
});

describe("optional wake environment copy", () => {
  it("keeps ordinary wake JSON byte-for-byte compatible", () => {
    const payload = wake("Current request");
    expect(stringifyPaperclipWakePayload(payload, { forEnvironment: true }))
      .toBe(stringifyPaperclipWakePayload(payload));
  });

  it.each(["x".repeat(220_000), "界".repeat(25_000)])(
    "omits an oversized UTF-8 env copy but preserves the full prompt and source",
    (body) => {
      const payload = wake(body);
      const original = JSON.stringify(payload);
      expect(Buffer.byteLength(stringifyPaperclipWakePayload(payload)!)).toBeGreaterThan(64 * 1024);
      expect(stringifyPaperclipWakePayload(payload, { forEnvironment: true })).toBeNull();
      expect(renderPaperclipWakePrompt(payload)).toContain(body);
      expect(JSON.stringify(payload)).toBe(original);
    },
  );

  it("uses a byte boundary including JSON overhead", () => {
    const overhead = Buffer.byteLength(stringifyPaperclipWakePayload(wake(""))!);
    const body = "x".repeat(64 * 1024 - overhead);
    expect(Buffer.byteLength(stringifyPaperclipWakePayload(wake(body), { forEnvironment: true })!))
      .toBe(64 * 1024);
    expect(stringifyPaperclipWakePayload(wake(body + "x"), { forEnvironment: true })).toBeNull();
  });
});
