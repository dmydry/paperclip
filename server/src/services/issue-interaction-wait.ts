import { eq, or, sql } from "drizzle-orm";
import { issueThreadInteractions, toolActionDeliveries, toolActionRequests } from "@paperclipai/db";

/** The server-owned request, not a client-authored interaction payload, owns execution. */
export function toolActionInteractionCondition() {
  return sql`exists (
    select 1 from ${toolActionRequests}
    where ${toolActionRequests.companyId} = ${issueThreadInteractions.companyId}
      and ${toolActionRequests.issueId} = ${issueThreadInteractions.issueId}
      and ${toolActionRequests.interactionId} = ${issueThreadInteractions.id}
  )`;
}

/** Approval resolution does not consume a server-owned execution/continuation path. */
export function waitingIssueInteractionCondition() {
  return or(
    eq(issueThreadInteractions.status, "pending"),
    sql`exists (
      select 1 from ${toolActionRequests}
      where ${toolActionRequests.companyId} = ${issueThreadInteractions.companyId}
        and ${toolActionRequests.issueId} = ${issueThreadInteractions.issueId}
        and ${toolActionRequests.interactionId} = ${issueThreadInteractions.id}
        and (
          ${toolActionRequests.status} in ('pending', 'approved', 'executing')
          or exists (
            select 1 from ${toolActionDeliveries}
            where ${toolActionDeliveries.companyId} = ${toolActionRequests.companyId}
              and ${toolActionDeliveries.issueId} = ${toolActionRequests.issueId}
              and ${toolActionDeliveries.actionRequestId} = ${toolActionRequests.id}
              and ${toolActionDeliveries.deliveredAt} is null
          )
        )
    )`,
  );
}
