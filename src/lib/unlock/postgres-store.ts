import { getSql } from "@/lib/db";
import type { GrantStore, TxInput } from "./store.ts";

/**
 * Neon when DATABASE_URL is set. The completion insert and the grant insert
 * are one statement, so a duplicate transaction id cannot restore a grant.
 */
export function createPostgresGrantStore(): GrantStore {
  return {
    async complete(input: TxInput) {
      const sql = await getSql();
      const rows = await sql.query<{ inserted_count: number }>(
        `with inserted as (
           insert into unlock_transactions
             (provider, transaction_id, visitor_id, revenue, kind)
           values ($1, $2, $3, $4, 'completed')
           on conflict (provider, transaction_id) do nothing
           returning visitor_id, provider, transaction_id
         ),
         granted as (
           insert into unlock_grants (visitor_id, provider, transaction_id)
           select visitor_id, provider, transaction_id from inserted
           on conflict (visitor_id) do update
             set provider = excluded.provider,
                 transaction_id = excluded.transaction_id,
                 granted_at = now()
           returning visitor_id
         )
         select
           (select count(*)::int from inserted) as inserted_count,
           (select count(*)::int from granted) as granted_count`,
        [input.provider, input.transactionId, input.visitorId, input.revenue],
      );
      return Number(rows[0]?.inserted_count ?? 0) > 0 ? "granted" : "duplicate";
    },
    async reverse(input: TxInput) {
      const sql = await getSql();
      await sql.query(
        `with upserted as (
           insert into unlock_transactions
             (provider, transaction_id, visitor_id, revenue, kind)
           values ($1, $2, $3, $4, 'reversed')
           on conflict (provider, transaction_id) do update
             set kind = 'reversed',
                 revenue = excluded.revenue,
                 visitor_id = excluded.visitor_id
           returning visitor_id
         )
         delete from unlock_grants
         where visitor_id = $3
           and exists (select 1 from upserted)`,
        [input.provider, input.transactionId, input.visitorId, input.revenue],
      );
    },
    async isUnlocked(visitorId: string) {
      const sql = await getSql();
      const rows = await sql.query<{ visitor_id: string }>(
        `select visitor_id from unlock_grants where visitor_id = $1`,
        [visitorId],
      );
      return rows.length > 0;
    },
  };
}
