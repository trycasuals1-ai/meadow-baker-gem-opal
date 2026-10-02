import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { GrantStore, TxInput, UnlockProvider } from "./store.ts";

type TxRow = {
  provider: UnlockProvider;
  transactionId: string;
  visitorId: string;
  revenue: string;
  kind: "completed" | "reversed";
  at: string;
};

type GrantRow = {
  provider: UnlockProvider;
  transactionId: string;
  grantedAt: string;
};

type GrantFile = {
  transactions: Record<string, TxRow>;
  grants: Record<string, GrantRow>;
};

const globalRef = globalThis as typeof globalThis & {
  __unlockJsonChain?: Promise<void>;
};

function emptyFile(): GrantFile {
  return { transactions: {}, grants: {} };
}

function defaultPath(): string {
  const override = process.env.GRANT_STORE_PATH?.trim();
  if (override) return override;
  return path.join(process.cwd(), "data", "unlock-grants.json");
}

function keyOf(input: TxInput): string {
  return `${input.provider}:${input.transactionId}`;
}

async function readGrants(filePath: string): Promise<GrantFile> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as GrantFile;
    if (!parsed || typeof parsed !== "object" || !parsed.transactions || !parsed.grants) {
      throw new Error("grant file is not a grant store");
    }
    return parsed;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return emptyFile();
    throw error;
  }
}

async function writeGrants(filePath: string, data: GrantFile): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.tmp`;
  await writeFile(tmp, JSON.stringify(data), "utf8");
  await rename(tmp, filePath);
}

function locked<T>(fn: () => Promise<T>): Promise<T> {
  const prev = globalRef.__unlockJsonChain ?? Promise.resolve();
  const run = prev.then(fn, fn);
  globalRef.__unlockJsonChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function createJsonGrantStore(filePath = defaultPath()): GrantStore {
  return {
    complete(input) {
      return locked(async () => {
        const data = await readGrants(filePath);
        const key = keyOf(input);
        const existing = data.transactions[key];
        if (existing) return "duplicate";
        data.transactions[key] = {
          provider: input.provider,
          transactionId: input.transactionId,
          visitorId: input.visitorId,
          revenue: input.revenue,
          kind: "completed",
          at: new Date().toISOString(),
        };
        data.grants[input.visitorId] = {
          provider: input.provider,
          transactionId: input.transactionId,
          grantedAt: new Date().toISOString(),
        };
        await writeGrants(filePath, data);
        return "granted";
      });
    },
    reverse(input) {
      return locked(async () => {
        const data = await readGrants(filePath);
        const key = keyOf(input);
        data.transactions[key] = {
          provider: input.provider,
          transactionId: input.transactionId,
          visitorId: input.visitorId,
          revenue: input.revenue,
          kind: "reversed",
          at: data.transactions[key]?.at ?? new Date().toISOString(),
        };
        delete data.grants[input.visitorId];
        await writeGrants(filePath, data);
      });
    },
    isUnlocked(visitorId) {
      return locked(async () => {
        const data = await readGrants(filePath);
        return Boolean(data.grants[visitorId]);
      });
    },
  };
}
