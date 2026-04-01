import { buildAgentMentionHref, buildProjectMentionHref } from "@paperclipai/shared";

export interface MentionLike {
  name: string;
  kind?: "agent" | "user" | "project";
  agentId?: string;
  agentIcon?: string | null;
  projectId?: string;
  projectColor?: string | null;
}

export function mentionMarkdown(option: MentionLike): string {
  if (option.kind === "project" && option.projectId) {
    return `[@${option.name}](${buildProjectMentionHref(option.projectId, option.projectColor ?? null)}) `;
  }
  if (option.kind === "agent") {
    const agentId = option.agentId;
    if (agentId) {
      return `[@${option.name}](${buildAgentMentionHref(agentId, option.agentIcon ?? null)}) `;
    }
  }
  return `@${option.name} `;
}

export function applyMention(markdown: string, query: string, option: MentionLike): string {
  const search = `@${query}`;
  const replacement = mentionMarkdown(option);
  const idx = markdown.lastIndexOf(search);
  if (idx === -1) return markdown;
  return markdown.slice(0, idx) + replacement + markdown.slice(idx + search.length);
}
