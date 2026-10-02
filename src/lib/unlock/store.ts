/**
 * Grant persistence. Postbacks talk only to this interface.
 * Postgres (DATABASE_URL / Neon) when it is configured; otherwise a JSON file
 * for a single long-running Node process. The SQL lives in postgres-store.ts
 * and migrations/0002_unlock.sql — swap is the factory below, not the handler.
 */

export type UnlockProvider = "bitlabs" | "lootably";

export type TxInput = {
  provider: UnlockProvider;
  transactionId: string;
  visitorId: string;
  revenue: string;
};

export type GrantStore = {
  /** Insert a completion. Duplicate transaction ids do not grant again. */
  complete(input: TxInput): Promise<"granted" | "duplicate">;
  /** Mark the transaction reversed and delete that visitor's grant. */
  reverse(input: TxInput): Promise<void>;
  isUnlocked(visitorId: string): Promise<boolean>;
};

export async function getGrantStore(): Promise<GrantStore> {
  if (process.env.DATABASE_URL?.trim()) {
    const { createPostgresGrantStore } = await import("./postgres-store.ts");
    return createPostgresGrantStore();
  }
  const { createJsonGrantStore } = await import("./json-store.ts");
  return createJsonGrantStore();
}
