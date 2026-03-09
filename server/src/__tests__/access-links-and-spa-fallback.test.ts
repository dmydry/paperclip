import fs from "node:fs";
import path from "node:path";
import request from "supertest";
import { afterEach, describe, expect, it } from "vitest";
import type { Request } from "express";
import { createApp } from "../app.js";
import { toInviteSummaryResponse } from "../routes/access.js";

function buildReq(host: string): Request {
  return {
    protocol: "http",
    header(name: string) {
      if (name.toLowerCase() === "host") return host;
      return undefined;
    },
  } as unknown as Request;
}

const uiDistDir = path.resolve("/Users/dmydry/projects/paperclip/ui/dist");
let createdUiDist = false;
let originalIndexHtml: string | null = null;

function ensureUiDist(html: string) {
  const indexPath = path.join(uiDistDir, "index.html");
  if (!fs.existsSync(uiDistDir)) {
    fs.mkdirSync(uiDistDir, { recursive: true });
    createdUiDist = true;
  }
  if (fs.existsSync(indexPath)) {
    originalIndexHtml = fs.readFileSync(indexPath, "utf8");
  }
  fs.writeFileSync(indexPath, html, "utf8");
}

afterEach(() => {
  const indexPath = path.join(uiDistDir, "index.html");
  if (originalIndexHtml !== null) {
    fs.writeFileSync(indexPath, originalIndexHtml, "utf8");
    originalIndexHtml = null;
    return;
  }
  if (fs.existsSync(indexPath)) {
    fs.rmSync(indexPath);
  }
  if (createdUiDist && fs.existsSync(uiDistDir)) {
    fs.rmSync(uiDistDir, { recursive: true, force: true });
    createdUiDist = false;
  }
});

describe("access links", () => {
  it("returns an absolute inviteUrl in invite summaries", () => {
    const req = buildReq("localhost:3100");
    const invite = {
      id: "invite-1",
      companyId: "company-1",
      inviteType: "company_join",
      allowedJoinTypes: "both",
      tokenHash: "hash",
      defaultsPayload: null,
      expiresAt: new Date("2026-03-05T00:00:00.000Z"),
      invitedByUserId: null,
      revokedAt: null,
      acceptedAt: null,
      createdAt: new Date("2026-03-04T00:00:00.000Z"),
      updatedAt: new Date("2026-03-04T00:00:00.000Z"),
    } as const;

    const summary = toInviteSummaryResponse(req, "token-123", invite as any);

    expect(summary.invitePath).toBe("/invite/token-123");
    expect(summary.inviteUrl).toBe("http://localhost:3100/invite/token-123");
    expect(summary.onboardingUrl).toBe("http://localhost:3100/api/invites/token-123/onboarding");
  });
});

describe("static ui deep links", () => {
  it("serves the SPA shell for invite and board-claim routes", async () => {
    ensureUiDist("<!doctype html><html><body><div id='root'>paperclip-test-shell</div></body></html>");

    const app = await createApp({} as any, {
      uiMode: "static",
      storageService: {} as any,
      deploymentMode: "local_trusted",
      deploymentExposure: "private",
      allowedHostnames: [],
      bindHost: "127.0.0.1",
      authReady: true,
      companyDeletionEnabled: false,
    });

    const inviteRes = await request(app).get("/invite/token-123");
    expect(inviteRes.status).toBe(200);
    expect(inviteRes.headers["content-type"]).toContain("text/html");
    expect(inviteRes.text).toContain("paperclip-test-shell");

    const claimRes = await request(app).get("/board-claim/token-123?code=abc");
    expect(claimRes.status).toBe(200);
    expect(claimRes.headers["content-type"]).toContain("text/html");
    expect(claimRes.text).toContain("paperclip-test-shell");
  });
});
