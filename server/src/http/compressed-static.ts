import fs from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream";
import { createBrotliCompress, createGzip } from "node:zlib";
import type { RequestHandler } from "express";

const COMPRESSIBLE_EXTENSIONS = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".map",
  ".mjs",
  ".svg",
  ".txt",
  ".wasm",
  ".xml",
]);

export type StaticCompressionEncoding = "br" | "gzip";

export function isCompressibleStaticAsset(filePath: string): boolean {
  return COMPRESSIBLE_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

export function selectStaticCompressionEncoding(acceptEncoding: string | undefined): StaticCompressionEncoding | null {
  if (!acceptEncoding) return null;
  const normalized = acceptEncoding.toLowerCase();
  if (/\bbr\b/.test(normalized)) return "br";
  if (/\bgzip\b/.test(normalized)) return "gzip";
  return null;
}

function resolveAssetPath(rootDir: string, requestPath: string): string | null {
  const relative = path.normalize(decodeURIComponent(requestPath)).replace(/^[/\\]+/, "");
  if (!relative || relative.startsWith("..")) return null;
  const filePath = path.resolve(rootDir, relative);
  const root = path.resolve(rootDir);
  if (filePath !== root && !filePath.startsWith(`${root}${path.sep}`)) return null;
  return filePath;
}

export function compressedStaticAssetMiddleware(
  rootDir: string,
  opts: {
    cacheControl?: string;
  } = {},
): RequestHandler {
  return (req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") {
      next();
      return;
    }

    const acceptEncoding = req.headers["accept-encoding"];
    const encoding = selectStaticCompressionEncoding(
      Array.isArray(acceptEncoding) ? acceptEncoding.join(",") : acceptEncoding,
    );
    if (!encoding) {
      next();
      return;
    }

    let filePath: string | null;
    try {
      filePath = resolveAssetPath(rootDir, req.path);
    } catch {
      next();
      return;
    }
    if (!filePath || !isCompressibleStaticAsset(filePath)) {
      next();
      return;
    }

    const stat = fs.statSync(filePath, { throwIfNoEntry: false });
    if (!stat?.isFile()) {
      next();
      return;
    }

    res.type(filePath);
    res.set("Content-Encoding", encoding);
    res.set("Vary", "Accept-Encoding");
    if (opts.cacheControl) {
      res.set("Cache-Control", opts.cacheControl);
    }
    if (req.method === "HEAD") {
      res.status(200).end();
      return;
    }

    const source = fs.createReadStream(filePath);
    const compressor = encoding === "br" ? createBrotliCompress() : createGzip();
    pipeline(source, compressor, res, (err) => {
      if (err && !res.headersSent) {
        next(err);
      }
    });
  };
}
