import type { QueryClient } from "@tanstack/react-query";
import { queryKeys } from "./queryKeys";

export function invalidateCompanyIssueQueries(queryClient: QueryClient, companyId: string) {
  queryClient.invalidateQueries({ queryKey: ["issues", companyId] });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard(companyId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.activity(companyId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.sidebarBadges(companyId) });
}
