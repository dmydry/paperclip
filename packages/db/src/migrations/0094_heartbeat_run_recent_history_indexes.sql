CREATE INDEX IF NOT EXISTS "heartbeat_runs_company_created_idx"
  ON "heartbeat_runs" USING btree ("company_id","created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "heartbeat_runs_company_agent_created_idx"
  ON "heartbeat_runs" USING btree ("company_id","agent_id","created_at" DESC);
