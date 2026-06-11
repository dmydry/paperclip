import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "../api/client";
import { inboxDismissalsApi } from "../api/inboxDismissals";
import { sidebarBadgesApi } from "../api/sidebarBadges";
import { queryKeys } from "../lib/queryKeys";
import {
  buildInboxDismissedAtByKey,
  type InboxBadgeData,
  loadDismissedInboxAlerts,
  saveDismissedInboxAlerts,
  loadReadInboxItems,
  saveReadInboxItems,
  READ_ITEMS_KEY,
} from "../lib/inbox";

export function useDismissedInboxAlerts() {
  const [dismissed, setDismissed] = useState<Set<string>>(loadDismissedInboxAlerts);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== "paperclip:inbox:dismissed") return;
      setDismissed(loadDismissedInboxAlerts());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const dismiss = (id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveDismissedInboxAlerts(next);
      return next;
    });
  };

  return { dismissed, dismiss };
}

export function useInboxDismissals(companyId: string | null | undefined) {
  const queryClient = useQueryClient();
  const queryKey = companyId
    ? queryKeys.inboxDismissals(companyId)
    : ["inbox-dismissals", "__disabled__"] as const;

  const { data: dismissals = [] } = useQuery({
    queryKey,
    queryFn: () => inboxDismissalsApi.list(companyId!),
    enabled: !!companyId,
  });

  const dismissMutation = useMutation({
    mutationFn: ({ itemKey }: { itemKey: string }) => inboxDismissalsApi.dismiss(companyId!, itemKey),
    onMutate: async ({ itemKey }) => {
      if (!companyId) return { previous: [] as typeof dismissals };
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<typeof dismissals>(queryKey) ?? [];
      const now = new Date();
      queryClient.setQueryData(queryKey, [
        {
          id: `optimistic:${itemKey}`,
          companyId,
          userId: "me",
          itemKey,
          dismissedAt: now,
          createdAt: now,
          updatedAt: now,
        },
        ...previous.filter((dismissal) => dismissal.itemKey !== itemKey),
      ]);
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: () => {
      if (!companyId) return;
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.sidebarBadges(companyId) });
    },
  });

  const dismissedAtByKey = useMemo(
    () => buildInboxDismissedAtByKey(dismissals),
    [dismissals],
  );

  return {
    dismissals,
    dismissedAtByKey,
    dismiss: (itemKey: string) => dismissMutation.mutate({ itemKey }),
    isPending: dismissMutation.isPending,
  };
}

export function useReadInboxItems() {
  const [readItems, setReadItems] = useState<Set<string>>(loadReadInboxItems);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== READ_ITEMS_KEY) return;
      setReadItems(loadReadInboxItems());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const markRead = (id: string) => {
    setReadItems((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveReadInboxItems(next);
      return next;
    });
  };

  const markUnread = (id: string) => {
    setReadItems((prev) => {
      const next = new Set(prev);
      next.delete(id);
      saveReadInboxItems(next);
      return next;
    });
  };

  return { readItems, markRead, markUnread };
}

export function useInboxBadge(companyId: string | null | undefined) {
  const { dismissed: dismissedAlerts } = useDismissedInboxAlerts();
  const dismissedAlertKey = useMemo(
    () => Array.from(dismissedAlerts).sort().join("|"),
    [dismissedAlerts],
  );
  const { data: sidebarBadges } = useQuery({
    queryKey: companyId
      ? [...queryKeys.sidebarBadges(companyId), "dismissed-alerts", dismissedAlertKey]
      : ["sidebar-badges", "__disabled__"] as const,
    queryFn: async () => {
      try {
        return await sidebarBadgesApi.get(companyId!, { dismissedAlerts });
      } catch (err) {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!companyId,
    retry: false,
    refetchInterval: 15_000,
  });

  return useMemo(
    (): InboxBadgeData => ({
      inbox: sidebarBadges?.inbox ?? 0,
      approvals: sidebarBadges?.approvals ?? 0,
      failedRuns: sidebarBadges?.failedRuns ?? 0,
      joinRequests: sidebarBadges?.joinRequests ?? 0,
      unreadTouchedIssues: sidebarBadges?.unreadTouchedIssues ?? 0,
      alerts: sidebarBadges?.alerts ?? 0,
    }),
    [sidebarBadges],
  );
}
