import express from "express";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { accessRoutes } from "../routes/access.js";
import { errorHandler } from "../middleware/index.js";

const mockAccessService = vi.hoisted(() => ({
  hasPermission: vi.fn(),
  canUser: vi.fn(),
  isInstanceAdmin: vi.fn(),
  getMembership: vi.fn(),
  ensureMembership: vi.fn(),
  listMembers: vi.fn(),
  setMemberPermissions: vi.fn(),
  promoteInstanceAdmin: vi.fn(),
  demoteInstanceAdmin: vi.fn(),
  listUserCompanyAccess: vi.fn(),
  setUserCompanyAccess: vi.fn(),
  setPrincipalGrants: vi.fn(),
}));

vi.mock("../services/index.js", () => ({
  accessService: () => mockAccessService,
  agentService: () => ({
    getById: vi.fn(),
  }),
  deduplicateAgentName: vi.fn(),
  logActivity: vi.fn(),
  notifyHireApproved: vi.fn(),
}));

function createApp(actor: Record<string, unknown>) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as any).actor = actor;
    next();
  });
  app.use(
    "/api",
    accessRoutes({} as any, {
      deploymentMode: "authenticated",
      deploymentExposure: "private",
      bindHost: "127.0.0.1",
      allowedHostnames: [],
    }),
  );
  app.use(errorHandler);
  return app;
}

describe("GET /companies/:companyId/members", () => {
  beforeEach(() => {
    mockAccessService.canUser.mockReset();
    mockAccessService.listMembers.mockReset();
    mockAccessService.setMemberPermissions.mockReset();
  });

  it("allows a regular company user to read members without manage_permissions", async () => {
    mockAccessService.canUser.mockResolvedValue(false);
    mockAccessService.listMembers.mockResolvedValue([
      {
        id: "member-1",
        companyId: "company-1",
        principalType: "user",
        principalId: "user-2",
        status: "active",
        membershipRole: "member",
        createdAt: new Date("2026-03-20T00:00:00.000Z"),
        updatedAt: new Date("2026-03-20T00:00:00.000Z"),
        userName: "BikeHouse Management",
        userEmail: "ops@example.com",
      },
    ]);

    const app = createApp({
      type: "board",
      userId: "user-1",
      companyIds: ["company-1"],
      source: "session",
      isInstanceAdmin: false,
    });

    const res = await request(app).get("/api/companies/company-1/members");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      principalId: "user-2",
      userName: "BikeHouse Management",
    });
    expect(mockAccessService.canUser).not.toHaveBeenCalled();
  });

  it("still requires manage_permissions to update member permissions", async () => {
    mockAccessService.canUser.mockResolvedValue(false);

    const app = createApp({
      type: "board",
      userId: "user-1",
      companyIds: ["company-1"],
      source: "session",
      isInstanceAdmin: false,
    });

    const res = await request(app)
      .patch("/api/companies/company-1/members/member-1/permissions")
      .send({ grants: [] });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Permission denied");
    expect(mockAccessService.setMemberPermissions).not.toHaveBeenCalled();
  });
});
