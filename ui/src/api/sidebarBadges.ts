import type { SidebarBadges } from "@paperclipai/shared";
import { api } from "./client";

export const sidebarBadgesApi = {
  get: (companyId: string, opts?: { dismissedAlerts?: Iterable<string> }) => {
    const searchParams = new URLSearchParams();
    for (const alert of opts?.dismissedAlerts ?? []) {
      searchParams.append("dismissedAlert", alert);
    }
    const qs = searchParams.toString();
    return api.get<SidebarBadges>(`/companies/${companyId}/sidebar-badges${qs ? `?${qs}` : ""}`);
  },
};
