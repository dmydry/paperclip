import { randomUUID } from "node:crypto";
import { expect, test, type APIResponse } from "@playwright/test";

// Real disposable API, database, storage and static UI; no agents/providers.
async function json(response: APIResponse) {
  expect(response.ok(), `${response.status()}: ${await response.text()}`).toBe(true);
  return response.json();
}

test("fork update preserves the board task, plan, QA-cycle and attachment contract", async ({ page, request }, testInfo) => {
  const health = await json(await request.get("/api/health"));
  expect(health.status).toBe("ok");
  const company = await json(await request.post("/api/companies", {
    data: { name: `Update smoke ${randomUUID()}` },
  }));
  const project = await json(await request.post(`/api/companies/${company.id}/projects`, {
    data: { name: "Disposable release verification" },
  }));
  const issue = await json(await request.post(`/api/companies/${company.id}/issues`, {
    data: { title: "Verify the isolated update", projectId: project.id, status: "todo", assigneeUserId: "local-board" },
  }));
  const qa = await json(await request.post(`/api/companies/${company.id}/issues`, {
    data: { title: "Disposable QA gate", parentId: issue.id, projectId: project.id, status: "todo", assigneeUserId: "local-board" },
  }));
  const issuePath = `/api/issues/${issue.id}`;
  // No generic blocked state without a real continuation.
  expect((await request.patch(issuePath, { data: { status: "blocked" } })).status()).toBe(422);
  for (let cycle = 1; cycle <= 2; cycle++) {
    if (cycle === 2) await json(await request.patch(`/api/issues/${qa.id}`, {
      data: { status: "todo", comment: "QA FAIL: reopen the same gate for the second cycle." },
    }));
    const blocked = await json(await request.patch(issuePath, {
      data: { status: "blocked", blockedByIssueIds: [qa.id] },
    }));
    expect(blocked.status).toBe("blocked");
    await json(await request.patch(`/api/issues/${qa.id}`, { data: { status: "done" } }));
    const released = await json(await request.patch(issuePath, { data: { status: "todo", blockedByIssueIds: [] } }));
    expect(released.status).toBe("todo");
  }
  await json(await request.put(`${issuePath}/documents/plan`, {
    data: { title: "Release smoke plan", format: "markdown", body: "# Plan\n\nUse only synthetic data.\n" },
  }));
  const plan = await json(await request.get(`${issuePath}/documents/plan`));
  expect(plan.body).toContain("Use only synthetic data.");
  const interaction = await json(await request.post(`${issuePath}/interactions`, {
    data: { kind: "request_confirmation", continuationPolicy: "none", payload: { version: 1, prompt: "Accept this synthetic smoke result?" } },
  }));
  await json(await request.post(`${issuePath}/interactions/${interaction.id}/accept`, { data: {} }));
  const interactions = await json(await request.get(`${issuePath}/interactions`));
  expect(interactions.find((entry: { id: string }) => entry.id === interaction.id)?.status).toBe("accepted");
  // Valid empty ZIP (end-of-central-directory record), not production content.
  const archive = Buffer.from("504b0506000000000000000000000000000000000000", "hex");
  const attachment = await json(await request.post(`/api/companies/${company.id}/issues/${issue.id}/attachments`, {
    multipart: { file: { name: "smoke.zip", mimeType: "application/zip", buffer: archive } },
  }));
  const downloaded = await request.get(attachment.contentPath);
  expect(downloaded.ok()).toBe(true);
  expect(await downloaded.body()).toEqual(archive);
  await json(await request.post(`${issuePath}/work-products`, {
    data: { type: "document", provider: "release-smoke", title: "Synthetic verification receipt", status: "ready_for_review" },
  }));
  await page.goto(`/${company.issuePrefix}/issues/${issue.identifier}`);
  await expect(page.getByRole("heading", { name: issue.title, exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("task-desktop.png"), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: issue.title, exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath("task-mobile.png"), fullPage: true });
  expect(await json(await request.get(`/api/companies/${company.id}/agents`))).toHaveLength(0);
  expect(await json(await request.get(`/api/companies/${company.id}/approvals`))).toHaveLength(0);
  await json(await request.patch(issuePath, { data: { status: "done" } }));
  await testInfo.attach("smoke-receipt", { contentType: "application/json", body: JSON.stringify({
    baseURL: testInfo.project.use.baseURL, instance: process.env.PAPERCLIP_INSTANCE_ID,
    home: process.env.PAPERCLIP_HOME, companyId: company.id, issueId: issue.id,
    data: "synthetic-only", providersCalled: false, qaCycles: 2,
  }) });
});
