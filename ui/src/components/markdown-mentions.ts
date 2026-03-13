import { buildProjectMentionHref } from "@paperclipai/shared";

export interface MentionLike {
  name: string;
  kind?: "agent" | "project";
  projectId?: string;
  projectColor?: string | null;
}

export function mentionMarkdown(option: MentionLike): string {
  if (option.kind === "project" && option.projectId) {
    return `[@${option.name}](${buildProjectMentionHref(option.projectId, option.projectColor ?? null)}) `;
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
