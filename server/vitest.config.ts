import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Server suites boot and tear down embedded Postgres fixtures. Paper-01
    // serial shards have crossed 30s during loaded runs, so keep 60s headroom.
    hookTimeout: 60_000,
    teardownTimeout: 60_000,
    isolate: true,
    maxConcurrency: 1,
    maxWorkers: 1,
    minWorkers: 1,
    pool: "forks",
    sequence: {
      concurrent: false,
      hooks: "list",
    },
    setupFiles: ["./src/__tests__/setup-supertest.ts"],
  },
});
