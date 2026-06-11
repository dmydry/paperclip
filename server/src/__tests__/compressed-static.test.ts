import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import express from "express";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { compressedStaticAssetMiddleware } from "../http/compressed-static.ts";

describe("compressed static asset middleware", () => {
  let rootDir: string;

  beforeAll(async () => {
    rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "paperclip-static-assets-"));
    await fs.writeFile(path.join(rootDir, "app.js"), "console.log('paperclip');".repeat(100));
    await fs.writeFile(path.join(rootDir, "icon.png"), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
  });

  afterAll(async () => {
    await fs.rm(rootDir, { recursive: true, force: true });
  });

  it("serves compressible assets with brotli when the client accepts it", async () => {
    const app = express();
    app.use("/assets", compressedStaticAssetMiddleware(rootDir, {
      cacheControl: "public, max-age=31536000, immutable",
    }));

    const res = await request(app)
      .get("/assets/app.js")
      .set("Accept-Encoding", "br, gzip")
      .buffer(true)
      .parse((response, callback) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
        response.on("end", () => callback(null, Buffer.concat(chunks)));
      });

    expect(res.status).toBe(200);
    expect(res.headers["content-encoding"]).toBe("br");
    expect(res.headers.vary).toContain("Accept-Encoding");
    expect(res.headers["cache-control"]).toBe("public, max-age=31536000, immutable");
  });

  it("passes non-compressible assets to later middleware", async () => {
    const app = express();
    app.use("/assets", compressedStaticAssetMiddleware(rootDir));
    app.use("/assets", (_req, res) => res.status(204).end());

    const res = await request(app)
      .get("/assets/icon.png")
      .set("Accept-Encoding", "br, gzip");

    expect(res.status).toBe(204);
    expect(res.headers["content-encoding"]).toBeUndefined();
  });
});
