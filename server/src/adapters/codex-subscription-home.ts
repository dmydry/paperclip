import path from "node:path";
import { resolvePaperclipInstanceRootForAdapter } from "@paperclipai/adapter-utils/server-utils";

function nonEmpty(value: string | undefined): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export function resolveCodexSubscription2Home(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const explicit = nonEmpty(env.PAPERCLIP_CODEX_SUBSCRIPTION_2_HOME);
  if (explicit) return path.resolve(explicit);
  const instanceRoot = resolvePaperclipInstanceRootForAdapter({
    homeDir: nonEmpty(env.PAPERCLIP_HOME) ?? undefined,
    instanceId: nonEmpty(env.PAPERCLIP_INSTANCE_ID) ?? undefined,
    env,
  });
  return path.resolve(instanceRoot, "codex-homes", "subscription-2");
}
